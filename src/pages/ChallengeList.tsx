import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { useChallenges, Challenge } from '../contexts/ChallengesContext';

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  expert: 'error',
} as const;

const ChallengeList = () => {
  const navigate = useNavigate();
  const { challenges, loading, error, fetchChallenges } = useChallenges();
  const [difficulty, setDifficulty] = useState<'all' | DifficultyLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChallenges(difficulty);
  }, [difficulty, fetchChallenges]);

  const filteredChallenges = challenges.filter((challenge: Challenge) =>
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading challenges...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Coding Challenges
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          label="Search challenges"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'all' | DifficultyLevel)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Levels</MenuItem>
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="expert">Expert</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {filteredChallenges.map((challenge: Challenge) => (
          <Grid item xs={12} sm={6} md={4} key={challenge.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h2">
                    {challenge.title}
                  </Typography>
                  <Chip
                    label={challenge.difficulty}
                    color={difficultyColors[challenge.difficulty as DifficultyLevel]}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary" paragraph>
                  {challenge.description}
                </Typography>
                <Typography variant="body2">
                  Points: {challenge.points}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/challenge/${challenge.id}`)}
                >
                  Start Challenge
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredChallenges.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No challenges found matching your criteria.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ChallengeList; 