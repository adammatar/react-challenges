import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Skeleton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { FlexBetween } from './styled';

interface CustomCardProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  chips?: Array<{
    label: string;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }>;
  loading?: boolean;
  onMoreClick?: () => void;
  elevation?: number;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  content,
  actions,
  chips,
  loading = false,
  onMoreClick,
  elevation = 0,
}) => {
  if (loading) {
    return (
      <Card
        elevation={elevation}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: (theme) => theme.palette.primary.main,
            borderTopLeftRadius: (theme) => theme.shape.borderRadius,
            borderTopRightRadius: (theme) => theme.shape.borderRadius,
          },
        }}
      >
        <CardHeader
          title={<Skeleton variant="text" width="60%" />}
          subheader={subtitle && <Skeleton variant="text" width="40%" />}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
        {actions && (
          <CardActions>
            <Skeleton variant="rectangular" width={100} height={36} />
          </CardActions>
        )}
      </Card>
    );
  }

  return (
    <Card
      elevation={elevation}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (theme) => theme.palette.primary.main,
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderTopRightRadius: (theme) => theme.shape.borderRadius,
        },
      }}
    >
      <CardHeader
        title={
          <FlexBetween>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {onMoreClick && (
              <IconButton onClick={onMoreClick} size="small">
                <MoreVertIcon />
              </IconButton>
            )}
          </FlexBetween>
        }
        subheader={
          subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )
        }
      />
      {chips && chips.length > 0 && (
        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              color={chip.color || 'primary'}
              size="small"
              sx={{
                borderRadius: 1,
                height: 24,
                '& .MuiChip-label': {
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                },
              }}
            />
          ))}
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>{content}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
};

export default CustomCard; 