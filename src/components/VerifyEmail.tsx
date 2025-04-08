import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  Link,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

interface LocationState {
  email?: string;
  message?: string;
  password?: string;
}

export default function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { email, message } = (state as LocationState) || {};
  const [checking, setChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const auth = getAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const checkVerification = async () => {
    if (!currentUser) return false;
    
    try {
      setChecking(true);
      // Force token refresh to get the latest email verification status
      await auth.currentUser?.reload();
      
      // Get fresh user data after reload
      const freshUser = auth.currentUser;
      
      if (freshUser?.emailVerified) {
        toast.success('Email verified successfully! You now have full access to the app.');
        navigate('/', { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Check immediately when component mounts
    checkVerification();

    // Set up interval for checking
    const interval = setInterval(async () => {
      const isVerified = await checkVerification();
      if (isVerified) {
        clearInterval(interval);
      } else {
        setCheckCount(prev => prev + 1);
        // Stop checking after 30 attempts (15 minutes)
        if (checkCount >= 30) {
          clearInterval(interval);
          toast.info('Please click the "Check Verification Status" button to manually check your verification status.');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResendVerification = async () => {
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser);
        toast.success('Verification email resent successfully!');
        setCheckCount(0);
      }
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        toast.error('Failed to resend verification email. Please try again later.');
      }
    }
  };

  const handleManualCheck = async () => {
    const isVerified = await checkVerification();
    if (!isVerified) {
      toast.info('Email not verified yet. Please check your inbox and click the verification link.');
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '450px',
        mx: 'auto',
        mt: { xs: 2, sm: 4, md: 6 },
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.shadows[6],
        }}
      >
        <EmailIcon
          sx={{
            width: 56,
            height: 56,
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography
          variant="h5"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Verify Your Email
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          {message || `A verification email has been sent to ${currentUser.email}. Please check your inbox and click the verification link to activate your account.`}
        </Typography>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleManualCheck}
            disabled={checking}
            sx={{ mb: 2 }}
          >
            {checking ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Checking Status...
              </>
            ) : (
              'Check Verification Status'
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResendVerification}
            disabled={checking}
            sx={{ mb: 2 }}
          >
            Resend Verification Email
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact support
        </Typography>
      </Paper>
    </Box>
  );
}