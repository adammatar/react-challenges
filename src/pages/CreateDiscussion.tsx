import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Autocomplete,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const AVAILABLE_TAGS = [
  'React', 'JavaScript', 'TypeScript', 'CSS', 'HTML',
  'Next.js', 'Node.js', 'Express', 'MongoDB', 'Firebase',
  'Testing', 'Performance', 'Security', 'Best Practices',
  'State Management', 'Hooks', 'Components', 'Styling',
  'Authentication', 'Deployment'
];

const CreateDiscussion: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const discussionsRef = collection(db, 'discussions');
      const docRef = await addDoc(discussionsRef, {
        title: title.trim(),
        content: content.trim(),
        userId: currentUser.uid,
        username: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
        tags: selectedTags,
      });

      // Create activity
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        type: 'discussion',
        userId: currentUser.uid,
        username: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        discussionId: docRef.id,
        discussionTitle: title.trim(),
        discussionContent: content.trim(),
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
      });

      navigate(`/discussions/${docRef.id}`);
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setSubmitting(false);
    }
  };

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

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Create Discussion
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                placeholder="What would you like to discuss?"
              />

              <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                fullWidth
                multiline
                rows={8}
                placeholder="Share your thoughts, questions, or insights..."
              />

              <Autocomplete
                multiple
                value={selectedTags}
                onChange={(_, newValue) => setSelectedTags(newValue)}
                options={AVAILABLE_TAGS}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Select relevant tags"
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !title.trim() || !content.trim()}
                  startIcon={<SendIcon />}
                >
                  {submitting ? 'Creating...' : 'Create Discussion'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateDiscussion; 