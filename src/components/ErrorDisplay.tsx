import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { FlexCenter } from './styled';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'Something went wrong',
  onRetry,
  fullHeight = false,
}) => {
  return (
    <FlexCenter
      sx={{
        flexDirection: 'column',
        gap: 3,
        height: fullHeight ? 'calc(100vh - 64px)' : '100%',
        minHeight: fullHeight ? undefined : 200,
        width: '100%',
        p: 3,
        textAlign: 'center',
      }}
    >
      <ErrorIcon
        sx={{
          fontSize: 64,
          color: 'error.main',
          animation: 'shake 0.5s ease-in-out',
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-10px)' },
            '75%': { transform: 'translateX(10px)' },
          },
        }}
      />
      <Box>
        <Typography
          variant="h5"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Oops!
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400, mx: 'auto' }}
        >
          {message}
        </Typography>
      </Box>
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            mt: 2,
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Try Again
        </Button>
      )}
    </FlexCenter>
  );
};

export default ErrorDisplay; 