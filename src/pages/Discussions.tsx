import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
  Chip,
  Divider,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Add as AddIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where, startAfter, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import useFirestoreQuery from '../hooks/useFirestoreQuery';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AVAILABLE_TAGS = [
  'React', 'JavaScript', 'TypeScript', 'CSS', 'HTML',
  'Next.js', 'Node.js', 'Express', 'MongoDB', 'Firebase',
  'Testing', 'Performance', 'Security', 'Best Practices',
  'State Management', 'Hooks', 'Components', 'Styling',
  'Authentication', 'Deployment'
];

interface Discussion {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string;
  userPhoto: string | null;
  timestamp: Date | { toDate: () => Date };
  likes: number;
  comments: number;
  tags: string[];
}

type SortOption = 'recent' | 'popular' | 'mostComments';

const Discussions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (id) {
      navigate(`/discussion/${id}`);
      return;
    }
  }, [id, navigate]);

  // Create the base query using useMemo
  const baseQuery = useMemo(() => {
    const discussionsRef = collection(db, 'discussions');
    let q = query(discussionsRef);

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('likes', 'desc'));
        break;
      case 'mostComments':
        q = query(q, orderBy('comments', 'desc'));
        break;
      default:
        q = query(q, orderBy('timestamp', 'desc'));
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', selectedTags));
    }

    // Apply pagination
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    q = query(q, limit(10));
    return q;
  }, [sortBy, selectedTags, lastVisible]); // Only recreate query when these dependencies change

  // Use our custom hook with memoized query
  const { data: discussions, loading, error, retrying, retry } = useFirestoreQuery<Discussion>(
    baseQuery,
    { maxRetries: 3, retryDelay: 1000 }
  );

  const loadMore = () => {
    // Implement loadMore functionality
  };

  const handleDeleteClick = (discussionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to discussion detail
    setDiscussionToDelete(discussionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!discussionToDelete) return;

    try {
      // Delete the discussion document
      await deleteDoc(doc(db, 'discussions', discussionToDelete));

      // Delete the associated activity
      const activitiesRef = collection(db, 'activities');
      const q = query(activitiesRef, 
        where('type', '==', 'discussion'),
        where('discussionId', '==', discussionToDelete)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      toast.success('Discussion deleted successfully');
      // Refresh the discussions list
      retry();
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error('Failed to delete discussion');
    } finally {
      setDeleteDialogOpen(false);
      setDiscussionToDelete(null);
    }
  };

  const filteredDiscussions = discussions?.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ForumIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Discussions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/discussions/new')}
          >
            Start Discussion
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="mostComments">Most Comments</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                sx={{ flex: 1 }}
                value={selectedTags}
                onChange={(_, newValue) => setSelectedTags(newValue)}
                options={AVAILABLE_TAGS}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Tags"
                    placeholder="Select tags"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      sx={{
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                      }}
                    />
                  ))
                }
              />
            </Box>
          </Stack>
        </Box>

        <Stack spacing={2}>
          {loading ? (
            <SkeletonLoader count={3} type="discussion" />
          ) : error ? (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="error" gutterBottom>
                    {error.message.includes('requires an index')
                      ? 'Building database index. This may take a few minutes...'
                      : 'Error loading discussions'}
                  </Typography>
                  {retrying ? (
                    <Typography variant="body2" color="text.secondary">
                      Retrying...
                    </Typography>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={retry}
                      startIcon={<RefreshIcon />}
                    >
                      Try Again
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : filteredDiscussions.length === 0 ? (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No discussions found
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {selectedTags.length > 0 || searchQuery
                      ? 'Try adjusting your filters or search terms'
                      : 'Be the first to start a discussion!'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/discussions/new')}
                  >
                    Start Discussion
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredDiscussions.map((discussion) => (
                <Card
                  key={discussion.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => navigate(`/discussions/${discussion.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar
                        src={discussion.userPhoto || undefined}
                        alt={discussion.username}
                      >
                        {discussion.username[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" gutterBottom>
                            {discussion.title}
                          </Typography>
                          {currentUser && discussion.userId === currentUser.uid && (
                            <IconButton
                              onClick={(e) => handleDeleteClick(discussion.id, e)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { bgcolor: 'error.light' },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Posted by {discussion.username} • {formatDistanceToNow(
                            discussion.timestamp instanceof Date 
                              ? discussion.timestamp 
                              : discussion.timestamp.toDate(), 
                            { addSuffix: true }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {discussion.content.length > 200 
                        ? `${discussion.content.substring(0, 200)}...` 
                        : discussion.content}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {discussion.tags.map((tag) => (
                        <Chip 
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ 
                            bgcolor: `${theme.palette.primary.main}15`,
                            color: theme.palette.primary.main,
                          }}
                        />
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        size="small"
                        startIcon={<LikeIcon />}
                        sx={{ color: 'text.secondary' }}
                      >
                        {discussion.likes}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CommentIcon />}
                        sx={{ color: 'text.secondary' }}
                      >
                        {discussion.comments}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loading || retrying}
                  sx={{ mt: 2 }}
                >
                  {loading || retrying ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </>
          )}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Discussion
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this discussion? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default Discussions; 