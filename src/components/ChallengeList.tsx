import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  styled,
  alpha,
} from '@mui/material';
import Button from './Button';

const ChallengeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
  },
}));

const difficultyGradients = {
  beginner: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#E8F5E9',
  },
  intermediate: {
    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    color: '#FFF3E0',
  },
  expert: {
    background: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
    color: '#FFEBEE',
  },
};

const DifficultyChip = styled(Chip)<{ difficulty: keyof typeof difficultyGradients }>(
  ({ theme, difficulty }) => ({
    background: difficultyGradients[difficulty].background,
    color: '#fff',
    fontWeight: 600,
    '& .MuiChip-label': {
      padding: '4px 12px',
    },
  })
);

interface ChallengeListProps {
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: keyof typeof difficultyGradients;
    points: number;
    completions: number;
  }>;
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challenges }) => {
  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <DifficultyChip
              difficulty={challenge.difficulty}
              label={challenge.difficulty.toUpperCase()}
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              {challenge.points} Points
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {challenge.title}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {challenge.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {challenge.completions} completions
            </Typography>
            <Button
              to={`/challenges/${challenge.id}`}
              variant="contained"
              size="small"
            >
              Start Challenge
            </Button>
          </Box>
        </ChallengeCard>
      ))}
    </Box>
  );
};

export default ChallengeList; 