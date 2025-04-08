import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  DeleteSweep as DeleteSweepIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  emailVerified: boolean;
  photoURL: string | null;
  createdAt: { seconds: number; nanoseconds: number };
  lastLogin: { seconds: number; nanoseconds: number };
  points: number;
  rank: string;
  completedChallenges: number;
  totalSubmissions: number;
  successRate: number;
}

interface UserActivity {
  type: string;
  details: string;
  timestamp: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId: string) => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities = activitiesSnapshot.docs.map(doc => ({
        type: doc.data().type,
        details: doc.data().details,
        timestamp: doc.data().timestamp,
      }));
      setUserActivities(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast.error('Failed to fetch user activities');
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleBulkAction = async (action: 'block' | 'unblock' | 'makeAdmin' | 'removeAdmin') => {
    try {
      const batch = writeBatch(db);
      selected.forEach((id) => {
        const ref = doc(db, 'users', id);
        switch (action) {
          case 'block':
            batch.update(ref, { isBlocked: true });
            break;
          case 'unblock':
            batch.update(ref, { isBlocked: false });
            break;
          case 'makeAdmin':
            batch.update(ref, { isAdmin: true });
            break;
          case 'removeAdmin':
            batch.update(ref, { isAdmin: false });
            break;
        }
      });
      await batch.commit();
      
      setUsers(prev => prev.map(user => {
        if (selected.includes(user.id)) {
          switch (action) {
            case 'block':
              return { ...user, isBlocked: true };
            case 'unblock':
              return { ...user, isBlocked: false };
            case 'makeAdmin':
              return { ...user, isAdmin: true };
            case 'removeAdmin':
              return { ...user, isAdmin: false };
            default:
              return user;
          }
        }
        return user;
      }));
      setSelected([]);
      toast.success(`Successfully updated ${selected.length} users`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to update users');
    }
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    await fetchUserActivities(user.id);
    setUserDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditFormData({
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
    });
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        username: editFormData.username,
        firstName: editFormData.firstName || null,
        lastName: editFormData.lastName || null,
        email: editFormData.email,
      });

      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id
          ? { ...user, ...editFormData }
          : user
      ));

      setEditDialogOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'admin' && user.isAdmin) ||
      (filterRole === 'user' && !user.isAdmin);
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && !user.isBlocked) ||
      (filterStatus === 'blocked' && user.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4 }}>User Management</Typography>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box flex={1}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
                <MenuItem value="user">Users</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box flex={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Paper>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              {selected.length} {selected.length === 1 ? 'user' : 'users'} selected
            </Typography>
            <Button
              startIcon={<BlockIcon />}
              color="error"
              onClick={() => handleBulkAction('block')}
            >
              Block Selected
            </Button>
            <Button
              startIcon={<CheckCircleIcon />}
              color="success"
              onClick={() => handleBulkAction('unblock')}
            >
              Unblock Selected
            </Button>
            <Button
              startIcon={<AdminIcon />}
              color="primary"
              onClick={() => handleBulkAction('makeAdmin')}
            >
              Make Admin
            </Button>
            <Button
              startIcon={<PersonIcon />}
              onClick={() => handleBulkAction('removeAdmin')}
            >
              Remove Admin
            </Button>
          </Box>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                      checked={filteredUsers.length > 0 && selected.length === filteredUsers.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Rank</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => {
                    const isSelected = selected.indexOf(user.id) !== -1;
                    return (
                      <TableRow
                        key={user.id}
                        selected={isSelected}
                        hover
                        onClick={() => handleClick(user.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={user.photoURL || undefined}
                              alt={user.username}
                              sx={{ width: 32, height: 32, mr: 2 }}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                {user.username}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.firstName} {user.lastName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isBlocked ? 'Blocked' : 'Active'}
                            color={user.isBlocked ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isAdmin ? 'Admin' : 'User'}
                            color={user.isAdmin ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>{user.rank}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(user);
                              }}
                            >
                              <TimelineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isBlocked ? 'Unblock' : 'Block'}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBulkAction(user.isBlocked ? 'unblock' : 'block');
                              }}
                              color={user.isBlocked ? 'error' : 'default'}
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* User Info */}
                <Box width={{ xs: '100%', md: '30%' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Avatar
                          src={selectedUser.photoURL || undefined}
                          alt={selectedUser.username}
                          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                        />
                        <Typography variant="h6">{selectedUser.username}</Typography>
                        <Typography color="text.secondary">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedUser.email}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Member Since"
                            secondary={formatDistanceToNow(
                              new Date(selectedUser.createdAt.seconds * 1000),
                              { addSuffix: true }
                            )}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Last Login"
                            secondary={formatDistanceToNow(
                              new Date(selectedUser.lastLogin.seconds * 1000),
                              { addSuffix: true }
                            )}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>

                {/* Stats */}
                <Box width={{ xs: '100%', md: '70%' }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box flex={1}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <StarIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">Points</Typography>
                            </Box>
                            <Typography variant="h4">{selectedUser.points}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rank: {selectedUser.rank}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                      <Box flex={1}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <EmailIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">Challenges</Typography>
                            </Box>
                            <Typography variant="h4">
                              {selectedUser.completedChallenges}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Success Rate: {selectedUser.successRate}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Stack>

                    {/* Recent Activity */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Activity
                        </Typography>
                        <List>
                          {userActivities.map((activity, index) => (
                            <ListItem key={index} divider={index < userActivities.length - 1}>
                              <ListItemText
                                primary={activity.details}
                                secondary={formatDistanceToNow(
                                  new Date(activity.timestamp),
                                  { addSuffix: true }
                                )}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              label="Username"
              value={editFormData.username}
              onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
              fullWidth
            />
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              value={editFormData.email}
              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              type="email"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 