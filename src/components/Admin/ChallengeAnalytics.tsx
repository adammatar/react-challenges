import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDistanceToNow } from 'date-fns';

interface Submission {
  id: string;
  challengeId: string;
  passed: boolean;
  executionTime: number;
  submittedAt: string;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface ChallengeStats {
  id: string;
  title: string;
  difficulty: string;
  totalAttempts: number;
  successfulAttempts: number;
  averageCompletionTime: number;
  lastAttempted: string;
  category: string;
}

interface AnalyticsData {
  totalAttempts: number;
  averageCompletionRate: number;
  averageCompletionTime: number;
  mostPopularDifficulty: string;
  challengeStats: ChallengeStats[];
}

export default function ChallengeAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAttempts: 0,
    averageCompletionRate: 0,
    averageCompletionTime: 0,
    mostPopularDifficulty: '',
    challengeStats: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculate the date range
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Fetch submissions within the date range
      const submissionsRef = collection(db, 'submissions');
      const submissionsQuery = query(
        submissionsRef,
        where('submittedAt', '>=', startDate.toISOString()),
        orderBy('submittedAt', 'desc')
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions: Submission[] = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Submission));

      // Fetch all challenges
      const challengesRef = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesRef);
      const challenges: Map<string, Challenge> = new Map(
        challengesSnapshot.docs.map(doc => [
          doc.id,
          { id: doc.id, ...doc.data() } as Challenge
        ])
      );

      // Calculate challenge-specific statistics
      const challengeStats = new Map<string, ChallengeStats>();
      let totalTime = 0;
      let successfulAttempts = 0;

      submissions.forEach(submission => {
        const challenge = challenges.get(submission.challengeId);
        if (!challenge) return;

        const stats = challengeStats.get(submission.challengeId) || {
          id: submission.challengeId,
          title: challenge.title,
          difficulty: challenge.difficulty,
          category: challenge.category,
          totalAttempts: 0,
          successfulAttempts: 0,
          averageCompletionTime: 0,
          lastAttempted: submission.submittedAt,
        };

        stats.totalAttempts++;
        if (submission.passed) {
          stats.successfulAttempts++;
          totalTime += submission.executionTime;
          successfulAttempts++;
        }

        challengeStats.set(submission.challengeId, stats);
      });

      // Calculate overall statistics
      const analyticsData: AnalyticsData = {
        totalAttempts: submissions.length,
        averageCompletionRate: (successfulAttempts / submissions.length) * 100 || 0,
        averageCompletionTime: totalTime / successfulAttempts || 0,
        mostPopularDifficulty: calculateMostPopularDifficulty(challengeStats),
        challengeStats: Array.from(challengeStats.values())
          .sort((a, b) => b.totalAttempts - a.totalAttempts),
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMostPopularDifficulty = (stats: Map<string, ChallengeStats>) => {
    const difficulties = new Map<string, number>();
    stats.forEach(stat => {
      difficulties.set(
        stat.difficulty,
        (difficulties.get(stat.difficulty) || 0) + stat.totalAttempts
      );
    });

    return Array.from(difficulties.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    expert: 'error',
  } as const;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Challenge Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TimelineIcon color="primary" />
              <Typography variant="h6">Total Attempts</Typography>
            </Box>
            <Typography variant="h4">{analytics.totalAttempts}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6">Completion Rate</Typography>
            </Box>
            <Typography variant="h4">
              {analytics.averageCompletionRate.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SpeedIcon color="primary" />
              <Typography variant="h6">Avg. Completion Time</Typography>
            </Box>
            <Typography variant="h4">
              {(analytics.averageCompletionTime / 1000).toFixed(2)}s
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <GradeIcon color="primary" />
              <Typography variant="h6">Popular Difficulty</Typography>
            </Box>
            <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
              {analytics.mostPopularDifficulty}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Challenge Statistics Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Challenge</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell align="right">Total Attempts</TableCell>
              <TableCell align="right">Success Rate</TableCell>
              <TableCell align="right">Last Attempted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.challengeStats.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>{challenge.title}</TableCell>
                <TableCell>{challenge.category}</TableCell>
                <TableCell>
                  <Chip
                    label={challenge.difficulty}
                    color={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{challenge.totalAttempts}</TableCell>
                <TableCell align="right">
                  {((challenge.successfulAttempts / challenge.totalAttempts) * 100).toFixed(1)}%
                </TableCell>
                <TableCell align="right">
                  {formatDistanceToNow(new Date(challenge.lastAttempted), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
} 