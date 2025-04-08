import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface Challenge {
  id: string;
  title: string;
  description: string;
  completedBy: number;
  points: number;
}

interface CompletedChallenge {
  completedAt: string;
  timeSpent: number;
  code: string;
}

const Challenges = () => {
  console.log('Challenges component rendering');
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  console.log('Current user:', currentUser);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, CompletedChallenge>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch completed challenges
  useEffect(() => {
    console.log('Fetch completed challenges effect running');
    
    const fetchCompletedChallenges = async () => {
      if (!currentUser) {
        console.log('No current user, skipping completed challenges fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching completed challenges for user:', currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          const completed = userData.completedChallenges || {};
          console.log('Completed challenges:', completed);
          setCompletedChallenges(completed);
        } else {
          console.log('User document not found');
          setError('User profile not found');
        }
      } catch (error) {
        console.error('Error fetching completed challenges:', error);
        setError('Failed to load completed challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedChallenges();
  }, [currentUser]);

  // Fetch challenges
  useEffect(() => {
    console.log('Fetch challenges effect running');
    
    const fetchChallenges = async () => {
      try {
        console.log('Fetching challenges from Firestore');
        const challengesRef = collection(db, 'challenges');
        const snapshot = await getDocs(challengesRef);
        const challengesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Challenge[];
        console.log('Fetched challenges:', challengesData);
        setChallenges(challengesData);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setError('Failed to load challenges');
      }
    };

    fetchChallenges();
  }, []);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  console.log('Rendering challenges list');
  console.log('Number of challenges:', challenges.length);
  console.log('Completed challenges:', completedChallenges);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {challenges.map((challenge) => {
          const isCompleted = Boolean(completedChallenges[challenge.id]);
          console.log(`Challenge ${challenge.id} (${challenge.title}) completed status:`, isCompleted);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={challenge.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: isCompleted ? 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)' : 'inherit',
                  color: isCompleted ? 'white' : 'inherit',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  }
                }}
              >
                {isCompleted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  >
                    <Tooltip title="Completed">
                      <CheckCircleIcon sx={{ color: 'white' }} />
                    </Tooltip>
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {challenge.title}
                  </Typography>
                  <Typography>
                    {challenge.description}
                  </Typography>
                  {isCompleted && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Completed in ${Math.floor(completedChallenges[challenge.id].timeSpent / 60)}m ${completedChallenges[challenge.id].timeSpent % 60}s`}
                        color="success"
                        size="small"
                        sx={{ mr: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      />
                      <Chip
                        label={`+${challenge.points} points`}
                        color="primary"
                        size="small"
                        sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      />
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    variant={isCompleted ? "contained" : "text"}
                    onClick={() => navigate(`/challenge/${challenge.id}/solve`)}
                    sx={{
                      color: isCompleted ? 'white' : 'primary',
                      backgroundColor: isCompleted ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isCompleted ? 'rgba(255, 255, 255, 0.3)' : undefined
                      }
                    }}
                  >
                    {isCompleted ? 'Review Solution' : 'Start Coding'}
                  </Button>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isCompleted ? 'white' : 'text.secondary',
                      ml: 'auto'
                    }}
                  >
                    {challenge.completedBy || 0} completions
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Challenges; 