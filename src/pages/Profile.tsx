import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  CheckCircle as CompletedIcon,
  Assignment as ChallengeIcon,
  School as CertificateIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, initializeUserProgress } from '../services/userService';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import { generateCertificate } from '../services/certificateService';
import ProgressTracking from '../components/ProgressTracking';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  points: number;
  completedAt?: Date;
}

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photoURL: string | null;
  displayName: string;
  isAdmin: boolean;
  createdAt: Date;
}

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  expert: 'error',
} as const;

export default function Profile() {
  console.log('Profile component is rendering');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  console.log('Current user:', currentUser?.uid);
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [inProgressChallenges, setInProgressChallenges] = useState<Challenge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rank, setRank] = useState('Novice');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        
        if (data) {
          // Use the photoURL from Firestore data
          console.log('Firestore photoURL:', data.photoURL); // Debug log
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            username: data.username || '',
            email: currentUser.email || '',
            photoURL: data.photoURL || null,
            displayName: currentUser.displayName || data.displayName || '',
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Add a real-time listener for profile updates
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      const data = doc.data();
      if (data) {
        setUserData(prevData => ({
          ...prevData!,
          photoURL: data.photoURL || null,
        }));
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        if (!currentUser) {
          console.log('No current user, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Initializing progress for user:', currentUser.uid);
        // Initialize progress if it doesn't exist
        await initializeUserProgress(currentUser.uid);

        console.log('Fetching user profile...');
        const userProfile = await getUserProfile(currentUser.uid);
        console.log('User profile data:', userProfile);
        
        if (!userProfile) {
          console.error('User profile not found');
          toast.error('Failed to load user profile');
          return;
        }

        console.log('Setting total points:', userProfile.progress.totalPoints);
        setTotalPoints(userProfile.progress.totalPoints);

        // Fetch completed challenges
        const completedPromises = Object.keys(userProfile.progress.completedChallenges).map(async (id) => {
          const challengeDoc = await getDoc(doc(db, 'challenges', id));
          return { id, ...challengeDoc.data() } as Challenge;
        });

        // Fetch in-progress challenges
        const inProgressPromises = Object.keys(userProfile.progress.inProgressChallenges).map(async (id) => {
          const challengeDoc = await getDoc(doc(db, 'challenges', id));
          return { id, ...challengeDoc.data() } as Challenge;
        });

        const completed = await Promise.all(completedPromises);
        const inProgress = await Promise.all(inProgressPromises);

        setCompletedChallenges(completed);
        setInProgressChallenges(inProgress);

        // Calculate rank based on points
        if (userProfile.progress.totalPoints >= 1000) {
          setRank('Master');
        } else if (userProfile.progress.totalPoints >= 500) {
          setRank('Expert');
        } else if (userProfile.progress.totalPoints >= 200) {
          setRank('Intermediate');
        } else {
          setRank('Novice');
        }

      } catch (error) {
        console.error('Error in fetchUserProgress:', error);
        toast.error('Failed to load progress');
      }
    };

    fetchUserProgress();
  }, [currentUser, navigate]);

  const handleGenerateCertificate = async (level: 'beginner' | 'intermediate' | 'expert') => {
    try {
      if (!currentUser || !userData) return;

      // Get total challenges for the level
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('difficulty', '==', level)
      );
      const challengesSnapshot = await getDocs(challengesQuery);
      const totalChallenges = challengesSnapshot.size;

      // Get completed challenges for the level
      const completedForLevel = completedChallenges.filter(
        challenge => challenge.difficulty === level
      ).length;

      // Check if eligible for certificate
      if (completedForLevel < totalChallenges) {
        toast.warning(`Complete all ${level} challenges to earn the certificate`);
        return;
      }

      // Generate and download certificate
      const url = await generateCertificate(
        currentUser.uid,
        userData.displayName || 'Anonymous',
        level,
        completedForLevel,
        totalChallenges
      );

      if (url) {
        window.open(url, '_blank');
        toast.success(`${level} level certificate generated successfully!`);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    }
  };

  const handleShareOnLinkedIn = (level: 'beginner' | 'intermediate' | 'expert') => {
    const certificateUrl = `${window.location.origin}/verify-certificate/${currentUser?.uid}/${level}`;
    const shareText = `I've earned my ${level} level React certification! Verify my certificate here:`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No profile data available</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* User Info Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={userData.photoURL || undefined}
            alt={userData.username}
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              bgcolor: 'primary.main'
            }}
          >
            {!userData.photoURL && userData.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              @{userData.username}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            icon={<TrophyIcon />}
            label={rank}
            color="primary"
          />
          <Chip
            icon={<StarIcon />}
            label={`${totalPoints} Points`}
            color="secondary"
          />
          <Chip
            icon={<CompletedIcon />}
            label={`${completedChallenges.length} Completed`}
          />
        </Box>
      </Paper>

      {/* Progress Tracking */}
      {currentUser && <ProgressTracking userId={currentUser.uid} />}

      {/* Certificates Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {(['beginner', 'intermediate', 'expert'] as const).map((level) => {
            const completedCount = completedChallenges.filter(
              c => c.difficulty === level
            ).length;
            const isEligible = completedCount > 0;

            return (
              <Card key={level}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CertificateIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {level}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completed: {completedCount} challenges
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleGenerateCertificate(level)}
                      disabled={!isEligible}
                    >
                      Generate Certificate
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => handleShareOnLinkedIn(level)}
                      startIcon={<LinkedInIcon />}
                      disabled={!isEligible}
                    >
                      Share on LinkedIn
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {/* Completed Challenges */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompletedIcon color="success" />
            Completed Challenges
          </Typography>
          <List>
            {completedChallenges.map((challenge) => (
              <div key={challenge.id}>
                <ListItem
                  component="div"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/challenge/${challenge.id}`)}
                >
                  <ListItemIcon>
                    <ChallengeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={challenge.title}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={challenge.difficulty}
                          color={difficultyColors[challenge.difficulty]}
                          size="small"
                          component="span"
                        />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {challenge.points} points
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
            {completedChallenges.length === 0 && (
              <ListItem>
                <ListItemText
                  secondary="No completed challenges yet. Start solving!"
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* In Progress Challenges */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon color="warning" />
            In Progress
          </Typography>
          <List>
            {inProgressChallenges.map((challenge) => (
              <div key={challenge.id}>
                <ListItem
                  component="div"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/challenge/${challenge.id}/solve`)}
                >
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={challenge.title}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={challenge.difficulty}
                          color={difficultyColors[challenge.difficulty]}
                          size="small"
                          component="span"
                        />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {challenge.points} points available
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
            {inProgressChallenges.length === 0 && (
              <ListItem>
                <ListItemText
                  secondary="No challenges in progress. Browse challenges to get started!"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
} 