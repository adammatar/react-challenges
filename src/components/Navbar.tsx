import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme as useMuiTheme,
  useMediaQuery,
  Container,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import {
  Home as HomeIcon,
  Leaderboard as LeaderboardIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Bookmark as BookmarkIcon,
  Forum as ForumIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import Notifications from './Notifications';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { getAuth, signOut } from 'firebase/auth';
import { setUser } from '../store/slices/authSlice';

interface UserProfile {
  username: string;
  photoURL: string | null;
  isAdmin: boolean;
}

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { mode, toggleColorMode } = useAppTheme();
  const dispatch = useAppDispatch();
  const auth = getAuth();
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/', requiresAuth: false },
    { label: 'Challenges', icon: <CodeIcon />, path: '/challenges', requiresAuth: true, requiresVerification: true },
    { label: 'Discussions', icon: <ForumIcon />, path: '/discussions', requiresAuth: true, requiresVerification: true },
    { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', requiresAuth: true, requiresVerification: true },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!currentUser) return false;
    if (item.requiresVerification && !currentUser.emailVerified) return false;
    return true;
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!currentUser.emailVerified) {
      navigate('/verify-email');
    }
  }, [currentUser, navigate]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          username: data.username || currentUser.email?.split('@')[0] || '',
          photoURL: data.photoURL || null,
          isAdmin: data.isAdmin || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch(setUser(null));
      toast.error('Failed to fetch user profile');
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: mode === 'dark' 
          ? 'rgba(10, 25, 41, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        borderBottom: 1,
        borderColor: mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
        borderRadius: 0,
        backgroundImage: mode === 'dark'
          ? 'linear-gradient(to right, rgba(10, 25, 41, 0.95), rgba(13, 35, 57, 0.95))'
          : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.95))',
        '& .MuiToolbar-root': {
          minHeight: { xs: '64px', sm: '70px' },
        },
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: { xs: '1 1 0', md: '0 0 auto' } }}>
            <IconButton
              color={mode === 'dark' ? 'inherit' : 'primary'}
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ 
                display: { md: 'none' },
                '&:hover': {
                  bgcolor: mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: mode === 'dark' ? 'white' : 'text.primary',
              textDecoration: 'none',
              background: mode === 'dark'
                ? 'linear-gradient(45deg, #2196F3, #3f51b5)'
                : 'linear-gradient(45deg, #1976d2, #9c27b0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                opacity: 0.85,
              },
              flexGrow: { xs: 0, md: 0 },
              textAlign: { xs: 'center', md: 'left' },
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            React Challenges
          </Typography>

          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' }, 
            gap: 1,
            justifyContent: 'flex-start',
            ml: { md: 4 }
          }}>
            {visibleNavItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: mode === 'dark' ? 'white' : 'text.primary',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-1px)',
                  },
                  '&.active': {
                    bgcolor: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            ml: 'auto',
            flex: { xs: '1 1 0', md: '0 0 auto' },
            justifyContent: { xs: 'flex-end', md: 'center' }
          }}>
            <IconButton
              onClick={toggleColorMode}
              sx={{ 
                color: mode === 'dark' ? 'white' : 'text.primary',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'rotate(10deg)',
                  bgcolor: mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {currentUser?.emailVerified && (
              <IconButton
                sx={{ 
                  color: mode === 'dark' ? 'white' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    bgcolor: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Notifications />
              </IconButton>
            )}

            {currentUser && (
              <>
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ 
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <Avatar
                    src={userProfile?.photoURL || undefined}
                    alt={userProfile?.username || ''}
                    sx={{ 
                      width: 35,
                      height: 35,
                      border: 2,
                      borderColor: mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 220,
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {userProfile?.username || currentUser?.email?.split('@')[0] || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/profile/edit"
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                  </MenuItem>
                  {currentUser.emailVerified && (
                    <MenuItem
                      component={Link}
                      to="/bookmarks"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <BookmarkIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Bookmarks</ListItemText>
                    </MenuItem>
                  )}
                  {userProfile?.isAdmin && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <AdminIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Admin Panel</ListItemText>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      <SwipeableDrawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => setMobileMenuOpen(true)}
      >
        <Box
          sx={{
            width: 250,
            pt: 2,
            pb: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
          role="presentation"
        >
          <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {visibleNavItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </AppBar>
  );
};

export default Navbar; 