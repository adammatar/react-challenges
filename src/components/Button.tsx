import React from 'react';
import {
  ButtonProps as MuiButtonProps,
  styled,
  alpha,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  transition: 'all 0.2s ease-in-out',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&.MuiButton-containedPrimary': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  '&.MuiButton-containedSecondary': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
    },
  },
  '&.MuiButton-outlined': {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
    },
  },
  '&.MuiButton-sizeLarge': {
    padding: '12px 32px',
    fontSize: '1.125rem',
  },
  '&.MuiButton-sizeSmall': {
    padding: '6px 16px',
    fontSize: '0.875rem',
  },
}));

export interface ButtonProps extends Omit<MuiButtonProps, 'component'> {
  loading?: boolean;
  to?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  to,
  ...props
}) => {
  if (to) {
    return (
      <RouterLink to={to} style={{ textDecoration: 'none' }}>
        <StyledLoadingButton
          loading={loading}
          loadingPosition="center"
          {...props}
        >
          {children}
        </StyledLoadingButton>
      </RouterLink>
    );
  }

  return (
    <StyledLoadingButton
      loading={loading}
      loadingPosition="center"
      {...props}
    >
      {children}
    </StyledLoadingButton>
  );
};

export default Button; 