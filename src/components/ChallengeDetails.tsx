import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  points: number;
  estimatedTime: string;
  category: string;
  completedBy: number;
  requirements: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  imageUrl?: string;
}

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  expert: 'error',
} as const;

export default function ChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        if (!challengeId) {
          toast.error('Challenge ID is missing');
          navigate('/challenges');
          return;
        }

        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);

        if (!challengeDoc.exists()) {
          toast.error('Challenge not found');
          navigate('/challenges');
          return;
        }

        setChallenge({
          id: challengeDoc.id,
          ...challengeDoc.data()
        } as Challenge);
      } catch (error) {
        console.error('Error fetching challenge:', error);
        toast.error('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/challenges')}
          sx={{ mb: 2 }}
        >
          Back to Challenges
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {challenge.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <Chip
            label={challenge.difficulty}
            color={difficultyColors[challenge.difficulty]}
            size="small"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon fontSize="small" color="primary" />
            <Typography variant="body2">{challenge.points} points</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon fontSize="small" />
            <Typography variant="body2">{challenge.estimatedTime}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CodeIcon fontSize="small" />
            <Typography variant="body2">Completed by {challenge.completedBy}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { md: '2fr 1fr' } }}>
        {/* Main Content */}
        <Box>
          {/* Description */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {challenge.description}
            </Typography>
          </Paper>

          {/* Requirements */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <List>
              {challenge.requirements.map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AssignmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Test Cases */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Cases
            </Typography>
            <List>
              {challenge.testCases.map((testCase, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Test Case ${index + 1}${testCase.isHidden ? ' (Hidden)' : ''}`}
                    secondary={
                      <Box component="div" sx={{ mt: 1 }}>
                        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                          Input: <code>{testCase.input}</code>
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ display: 'block', mt: 0.5 }}>
                          Expected Output: <code>{testCase.expectedOutput}</code>
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ready to Start?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click the button below to begin coding your solution.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(`/challenge/${challengeId}/solve`)}
                startIcon={<CodeIcon />}
              >
                Start Coding
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 