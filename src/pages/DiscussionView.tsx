import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Stack,
  Chip,
  Divider,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  increment,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  userPhoto: string | null;
  timestamp: Date;
  likes: number;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string;
  userPhoto: string | null;
  timestamp: Date;
  likes: number;
  comments: number;
  tags: string[];
}

const DiscussionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (id) {
      // Set up real-time listener for discussion
      const discussionRef = doc(db, 'discussions', id);
      const unsubscribeDiscussion = onSnapshot(discussionRef, (doc) => {
        if (doc.exists()) {
          setDiscussion({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
          } as Discussion);
        }
        setLoading(false);
      });

      // Set up real-time listener for comments
      const commentsRef = collection(db, 'discussions', id, 'comments');
      const q = query(commentsRef, orderBy('timestamp', 'desc'));
      const unsubscribeComments = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        })) as Comment[];
        setComments(commentsData);
      });

      // Check bookmark status
      checkBookmarkStatus();

      return () => {
        unsubscribeDiscussion();
        unsubscribeComments();
      };
    }
  }, [id, currentUser]);

  const checkBookmarkStatus = async () => {
    if (!currentUser || !id) return;
    try {
      const bookmarkRef = doc(db, 'bookmarks', currentUser.uid, 'discussions', id);
      const bookmarkDoc = await getDoc(bookmarkRef);
      setIsBookmarked(bookmarkDoc.exists());
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser || !id || !discussion) return;
    try {
      const bookmarkRef = doc(db, 'bookmarks', currentUser.uid, 'discussions', id);
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        setIsBookmarked(false);
        showSnackbar('Discussion removed from bookmarks', 'success');
      } else {
        await setDoc(bookmarkRef, {
          discussionId: id,
          title: discussion.title,
          timestamp: serverTimestamp(),
        });
        setIsBookmarked(true);
        showSnackbar('Discussion bookmarked', 'success');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showSnackbar('Failed to update bookmark', 'error');
    }
  };

  const handleShare = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShareOption = (platform: string) => {
    const url = window.location.href;
    const title = discussion?.title || 'Check out this discussion';
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        showSnackbar('Link copied to clipboard', 'success');
        handleShareClose();
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    handleShareClose();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddComment = async () => {
    if (!currentUser || !newComment.trim()) return;

    try {
      const commentsRef = collection(db, 'discussions', id!, 'comments');
      await addDoc(commentsRef, {
        content: newComment,
        userId: currentUser.uid,
        username: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        timestamp: serverTimestamp(),
        likes: 0,
      });

      // Update discussion's comment count
      const discussionRef = doc(db, 'discussions', id!);
      await updateDoc(discussionRef, {
        comments: increment(1),
      });

      // Create activity
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        type: 'comment',
        userId: currentUser.uid,
        username: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        discussionId: id,
        discussionTitle: discussion?.title,
        comment: newComment,
        timestamp: serverTimestamp(),
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      showSnackbar('Failed to add comment', 'error');
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const discussionRef = doc(db, 'discussions', id!);
      await updateDoc(discussionRef, {
        likes: increment(1),
      });
      showSnackbar('Discussion liked!', 'success');
    } catch (error) {
      console.error('Error liking discussion:', error);
      showSnackbar('Failed to like discussion', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!discussion) {
    return <div>Discussion not found</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/discussions')}
          sx={{ mb: 2 }}
        >
          Back to Discussions
        </Button>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Avatar
                src={discussion.userPhoto || undefined}
                alt={discussion.username}
                sx={{ width: 56, height: 56 }}
              >
                {discussion.username[0].toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {discussion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted by {discussion.username} • {formatDistanceToNow(discussion.timestamp, { addSuffix: true })}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {discussion.content}
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
                startIcon={<LikeIcon />}
                onClick={handleLike}
                sx={{ color: 'text.secondary' }}
              >
                {discussion.likes}
              </Button>
              <Button
                startIcon={<CommentIcon />}
                sx={{ color: 'text.secondary' }}
              >
                {discussion.comments}
              </Button>
              <IconButton onClick={handleBookmark}>
                {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Card>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Stack spacing={2}>
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar
                  src={comment.userPhoto || undefined}
                  alt={comment.username}
                >
                  {comment.username[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {comment.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1">
                {comment.content}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<LikeIcon />}
                  sx={{ color: 'text.secondary' }}
                >
                  {comment.likes}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={() => handleShareOption('twitter')}>
          <TwitterIcon sx={{ mr: 1 }} /> Share on Twitter
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('linkedin')}>
          <LinkedInIcon sx={{ mr: 1 }} /> Share on LinkedIn
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('facebook')}>
          <FacebookIcon sx={{ mr: 1 }} /> Share on Facebook
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('copy')}>
          <LinkIcon sx={{ mr: 1 }} /> Copy Link
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DiscussionView; 