import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Chip,
  Badge,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Whatshot as StreakIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

interface ProgressStats {
  beginner: { completed: number; total: number; estimatedTime: number };
  intermediate: { completed: number; total: number; estimatedTime: number };
  expert: { completed: number; total: number; estimatedTime: number };
}

interface Challenge {
  id: string;
  difficulty: DifficultyLevel;
  estimatedTime: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface ProgressTrackingProps {
  userId: string;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ userId }) => {
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    beginner: { completed: 0, total: 0, estimatedTime: 0 },
    intermediate: { completed: 0, total: 0, estimatedTime: 0 },
    expert: { completed: 0, total: 0, estimatedTime: 0 },
  });
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressStats();
    calculateStreak();
    updateAchievements();
  }, [userId]);

  const fetchProgressStats = async () => {
    try {
      // Fetch all challenges
      const challengesRef = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesRef);
      const challenges = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];

      // Fetch user's completed challenges
      const userRef = collection(db, 'users');
      const userDoc = await getDocs(query(userRef, where('id', '==', userId)));
      const userData = userDoc.docs[0]?.data();
      const completedChallenges = userData?.progress?.completedChallenges || {};

      // Calculate stats for each difficulty level
      const stats = { ...progressStats };

      challenges.forEach(challenge => {
        if (challenge.difficulty) {
          stats[challenge.difficulty].total += 1;
          stats[challenge.difficulty].estimatedTime += parseInt(challenge.estimatedTime) || 0;
          if (completedChallenges[challenge.id]) {
            stats[challenge.difficulty].completed += 1;
          }
        }
      });

      setProgressStats(stats);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  const calculateStreak = async () => {
    try {
      // Implement streak calculation logic here
      // For now, we'll set a dummy value
      setStreak(5);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const updateAchievements = () => {
    const newAchievements: Achievement[] = [
      {
        id: 'first-challenge',
        title: 'First Steps',
        description: 'Complete your first challenge',
        icon: <StarIcon color="primary" />,
        unlocked: progressStats.beginner.completed > 0,
      },
      {
        id: 'beginner-master',
        title: 'Beginner Master',
        description: 'Complete all beginner challenges',
        icon: <TrophyIcon color="success" />,
        unlocked: progressStats.beginner.completed === progressStats.beginner.total,
      },
      {
        id: 'streak-warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 5-day streak',
        icon: <StreakIcon color="error" />,
        unlocked: streak >= 5,
      },
    ];
    setAchievements(newAchievements);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Progress Overview
      </Typography>
      
      {/* Progress Bars */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {Object.entries(progressStats).map(([level, stats]) => (
          <Card key={level}>
            <CardContent>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {level}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {stats.completed}/{stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.completed / stats.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TimerIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Est. time remaining: {formatTime(stats.estimatedTime * (stats.total - stats.completed))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Streak */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Streak
        </Typography>
        <Chip
          icon={<StreakIcon />}
          label={`${streak} days`}
          color="error"
          variant="outlined"
          sx={{ mr: 1 }}
        />
      </Box>

      {/* Achievements */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {achievements.map((achievement) => (
            <Tooltip key={achievement.id} title={achievement.description}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={achievement.unlocked ? '✓' : ''}
              >
                <Chip
                  icon={achievement.icon as any}
                  label={achievement.title}
                  variant={achievement.unlocked ? "filled" : "outlined"}
                  sx={{
                    opacity: achievement.unlocked ? 1 : 0.6,
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Badge>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressTracking; 