import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import {
  BookmarkRemove as BookmarkRemoveIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface BookmarkedDiscussion {
  id: string;
  discussionId: string;
  title: string;
  timestamp: Date;
  discussion?: {
    content: string;
    username: string;
    userPhoto: string | null;
    likes: number;
    comments: number;
    tags: string[];
  };
}

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!currentUser) return;

    const bookmarksRef = collection(db, 'bookmarks', currentUser.uid, 'discussions');
    const q = query(bookmarksRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookmarksData = await Promise.all(
        snapshot.docs.map(async (bookmarkDoc) => {
          const data = bookmarkDoc.data();
          // Fetch the actual discussion data
          const discussionRef = doc(db, 'discussions', data.discussionId);
          const discussionDoc = await getDoc(discussionRef);
          
          return {
            id: bookmarkDoc.id,
            discussionId: data.discussionId,
            title: data.title,
            timestamp: data.timestamp.toDate(),
            discussion: discussionDoc.exists() ? {
              content: discussionDoc.data()?.content || '',
              username: discussionDoc.data()?.username || '',
              userPhoto: discussionDoc.data()?.userPhoto || null,
              likes: discussionDoc.data()?.likes || 0,
              comments: discussionDoc.data()?.comments || 0,
              tags: discussionDoc.data()?.tags || [],
            } : undefined,
          } as BookmarkedDiscussion;
        })
      );
      setBookmarks(bookmarksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'bookmarks', currentUser.uid, 'discussions', bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleDiscussionClick = (discussionId: string) => {
    navigate(`/discussions/${discussionId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading bookmarks...</Typography>
      </Container>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h5" gutterBottom>
            No bookmarked discussions yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Bookmark interesting discussions to read them later
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/discussions')}
          >
            Browse Discussions
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Bookmarks
      </Typography>

      <Stack spacing={2}>
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {bookmark.discussion && (
                  <Avatar
                    src={bookmark.discussion.userPhoto || undefined}
                    alt={bookmark.discussion.username}
                  >
                    {bookmark.discussion.username[0].toUpperCase()}
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => handleDiscussionClick(bookmark.discussionId)}
                  >
                    {bookmark.title}
                  </Typography>
                  
                  {bookmark.discussion && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        By {bookmark.discussion.username} • Bookmarked {formatDistanceToNow(bookmark.timestamp, { addSuffix: true })}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                        }}
                      >
                        {bookmark.discussion.content}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {bookmark.discussion.tags.map((tag) => (
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

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          size="small"
                          startIcon={<LikeIcon />}
                          sx={{ color: 'text.secondary' }}
                        >
                          {bookmark.discussion.likes}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CommentIcon />}
                          sx={{ color: 'text.secondary' }}
                        >
                          {bookmark.discussion.comments}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                          sx={{ ml: 'auto' }}
                        >
                          <BookmarkRemoveIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default Bookmarks; 