import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Tabs,
  Tab,
  Avatar,
  Button,
} from '@mui/material';
import { LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Challenge } from '../contexts/ChallengesContext';

interface UserScore {
  userId: string;
  displayName: string;
  photoURL: string | null;
  totalPoints: number;
  challengesCompleted: number;
  beginnerChallenges: number;
  intermediateChallenges: number;
  expertChallenges: number;
}

interface LeaderboardTab {
  label: string;
  value: string;
}

const tabs: LeaderboardTab[] = [
  { label: 'Overall', value: 'overall' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Expert', value: 'expert' },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all challenges
        const challengesSnapshot = await getDocs(collection(db, 'challenges'));
        const challengesData = challengesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[];
        setChallenges(challengesData);

        // Fetch all submissions
        const submissionsSnapshot = await getDocs(
          query(collection(db, 'submissions'), where('passed', '==', true))
        );

        // Group submissions by user
        const userSubmissions = submissionsSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          if (!acc[data.userId]) {
            acc[data.userId] = {
              submissions: [],
              challengeIds: new Set(),
            };
          }
          acc[data.userId].submissions.push(data);
          acc[data.userId].challengeIds.add(data.challengeId);
          return acc;
        }, {} as Record<string, { submissions: any[], challengeIds: Set<string> }>);

        // Fetch user details
        const userIds = Object.keys(userSubmissions);
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), where('id', 'in', userIds))
        );

        // Calculate scores
        const scores: UserScore[] = usersSnapshot.docs.map(doc => {
          const userData = doc.data();
          const userSubs = userSubmissions[userData.id];
          const completedChallenges = challenges.filter(c => userSubs.challengeIds.has(c.id));

          return {
            userId: userData.id,
            displayName: userData.displayName || 'Anonymous',
            photoURL: userData.photoURL,
            totalPoints: completedChallenges.reduce((sum, c) => sum + c.points, 0),
            challengesCompleted: userSubs.challengeIds.size,
            beginnerChallenges: completedChallenges.filter(c => c.difficulty === 'beginner').length,
            intermediateChallenges: completedChallenges.filter(c => c.difficulty === 'intermediate').length,
            expertChallenges: completedChallenges.filter(c => c.difficulty === 'expert').length,
          };
        });

        // Sort by relevant criteria
        const sortedScores = scores.sort((a, b) => {
          if (activeTab === 'overall') return b.totalPoints - a.totalPoints;
          if (activeTab === 'beginner') return b.beginnerChallenges - a.beginnerChallenges;
          if (activeTab === 'intermediate') return b.intermediateChallenges - a.intermediateChallenges;
          return b.expertChallenges - a.expertChallenges;
        });

        setLeaderboard(sortedScores);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleShareOnLinkedIn = (score: UserScore) => {
    const text = `I've completed ${score.challengesCompleted} React coding challenges and earned ${score.totalPoints} points on React Challenges! 🏆\n\nBeginner: ${score.beginnerChallenges}\nIntermediate: ${score.intermediateChallenges}\nExpert: ${score.expertChallenges}`;
    
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="leaderboard categories"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Challenges Completed</TableCell>
              <TableCell align="right">Share</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((score, index) => (
              <TableRow key={score.userId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={score.photoURL || undefined} alt={score.displayName}>
                      {score.displayName[0]}
                    </Avatar>
                    <Typography>{score.displayName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{score.totalPoints}</TableCell>
                <TableCell align="right">
                  {activeTab === 'overall' && score.challengesCompleted}
                  {activeTab === 'beginner' && score.beginnerChallenges}
                  {activeTab === 'intermediate' && score.intermediateChallenges}
                  {activeTab === 'expert' && score.expertChallenges}
                </TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<LinkedInIcon />}
                    onClick={() => handleShareOnLinkedIn(score)}
                    size="small"
                  >
                    Share
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Leaderboard; 