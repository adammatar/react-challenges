import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { FlexCenter } from './styled';

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  fullHeight?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
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
      <Icon
        sx={{
          fontSize: 64,
          color: 'primary.main',
          opacity: 0.8,
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
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
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400, mx: 'auto' }}
        >
          {message}
        </Typography>
      </Box>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{
            mt: 2,
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </FlexCenter>
  );
};

export default EmptyState; 