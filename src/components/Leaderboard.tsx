import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Skeleton,
  Chip,
} from '@mui/material';
import { getLeaderboard } from '../services/communityService';
import { calculateRank } from '../services/communityService';

interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  photoURL: string | null;
  totalPoints: number;
  achievements: number;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('allTime');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(timeframe);
        setLeaders(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  const handleTimeframeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTimeframe: 'weekly' | 'monthly' | 'allTime'
  ) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'inherit';
    }
  };

  return (
    <Card sx={{ width: '100%', mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Leaderboard
          </Typography>
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={handleTimeframeChange}
            aria-label="timeframe"
            size="small"
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="allTime">All Time</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Achievements</TableCell>
                <TableCell align="right">Rank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Skeleton width={100} />
                      </Box>
                    </TableCell>
                    <TableCell align="right"><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : (
                leaders.map((leader) => (
                  <TableRow
                    key={leader.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      '&:hover': { backgroundColor: 'action.selected' },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="h6"
                        sx={{ color: getRankColor(leader.rank), fontWeight: 'bold' }}
                      >
                        #{leader.rank}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={leader.photoURL || undefined}
                          alt={leader.displayName}
                          sx={{ mr: 2 }}
                        />
                        <Typography>{leader.displayName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {leader.totalPoints.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${leader.achievements} 🏆`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={calculateRank(leader.totalPoints)}
                        color={getRankChipColor(leader.totalPoints)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const getRankChipColor = (points: number): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  if (points >= 5000) return 'error'; // Grand Master
  if (points >= 3000) return 'warning'; // Master
  if (points >= 2000) return 'secondary'; // Expert
  if (points >= 1000) return 'info'; // Advanced
  if (points >= 500) return 'success'; // Intermediate
  if (points >= 100) return 'primary'; // Beginner
  return 'default'; // Novice
};

export default Leaderboard; 