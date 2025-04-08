import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { FlexCenter } from './styled';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 40,
  fullHeight = false,
}) => {
  return (
    <FlexCenter
      sx={{
        flexDirection: 'column',
        gap: 2,
        height: fullHeight ? 'calc(100vh - 64px)' : '100%',
        minHeight: fullHeight ? undefined : 200,
        width: '100%',
      }}
    >
      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </FlexCenter>
  );
};

export default LoadingSpinner; 