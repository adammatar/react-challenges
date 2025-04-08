import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChallenges } from '../contexts/ChallengesContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Challenge } from '../types/challenge';
import { ChallengeSolver as ChallengeSolverComponent } from '../components/ChallengeSolver/index';
import { CircularProgress, Box } from '@mui/material';

const ChallengeSolver = () => {
  console.log('Rendering ChallengeSolver component');
  
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) {
        navigate('/challenges');
        return;
      }

      try {
        const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
        if (challengeDoc.exists()) {
          setChallenge(challengeDoc.data() as Challenge);
        } else {
          navigate('/challenges');
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
        navigate('/challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!challenge) {
    return null;
  }

  return <ChallengeSolverComponent challenge={challenge} />;
};

export default ChallengeSolver; 