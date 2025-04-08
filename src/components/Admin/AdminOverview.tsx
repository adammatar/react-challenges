import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Code as CodeIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalChallenges: number;
  completedChallenges: number;
  averageCompletionRate: number;
  topUsers: {
    username: string;
    points: number;
    completedChallenges: number;
  }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      const activeUsers = users.filter(user => !user.isBlocked).length;

      // Fetch challenges
      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const challenges = challengesSnapshot.docs.map(doc => doc.data());

      // Fetch submissions
      const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
      const submissions = submissionsSnapshot.docs.map(doc => doc.data());
      const completedSubmissions = submissions.filter(sub => sub.status === 'completed');

      // Calculate completion rate
      const completionRate = challenges.length > 0 && users.length > 0
        ? (completedSubmissions.length / (challenges.length * users.length)) * 100
        : 0;

      // Get top users
      const topUsersQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(5)
      );
      const topUsersSnapshot = await getDocs(topUsersQuery);
      const topUsers = topUsersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          username: data.username || 'Anonymous',
          points: Number(data.points) || 0,
          completedChallenges: Number(data.completedChallenges) || 0,
        };
      });

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalChallenges: challenges.length,
        completedChallenges: completedSubmissions.length,
        averageCompletionRate: Math.round(completionRate),
        topUsers,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No statistics available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard Overview</Typography>

      {/* Main Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{stats.totalUsers}</Typography>
                <Typography color="text.secondary">Total Users</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stats.activeUsers} active users
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CodeIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{stats.totalChallenges}</Typography>
                <Typography color="text.secondary">Total Challenges</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stats.completedChallenges} completed submissions
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{stats.averageCompletionRate}%</Typography>
                <Typography color="text.secondary">Completion Rate</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Average challenge completion
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Top Users */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Top Performers
          </Typography>
          <Stack spacing={2}>
            {stats.topUsers.map((user, index) => (
              <Box
                key={user.username}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: index === 0 ? 'primary.light' : 'transparent',
                  borderRadius: 1,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: index === 0 ? 'primary.main' : 'grey.300',
                      color: index === 0 ? 'white' : 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography>{user.username}</Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography color="text.secondary">
                    {user.points} points
                  </Typography>
                  <Typography color="text.secondary">
                    {user.completedChallenges} challenges
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
} 