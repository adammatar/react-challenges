import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  linkWithCredential, 
  getAuth,
  AuthCredential,
  OAuthCredential
} from 'firebase/auth';
import { toast } from 'react-toastify';

export default function LinkAccounts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  
  // Get the credentials passed from the Login component
  const { email, pendingCred } = location.state || {};

  useEffect(() => {
    // If we don't have the necessary data, redirect to login
    if (!email || !pendingCred) {
      console.error('Missing required data:', { email, pendingCred });
      toast.error('Missing required information for account linking');
      navigate('/login');
      return;
    }

    console.log('Received data:', { email, pendingCred });
  }, [email, pendingCred, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in for linking...');
      
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user.email);
      
      if (result.user.email === email) {
        // Reconstruct the credential if needed
        const credential = pendingCred as AuthCredential;
        
        try {
          await linkWithCredential(result.user, credential);
          console.log('Account linking successful');
          toast.success('Accounts successfully linked! You can now use either method to sign in.');
          navigate('/', { replace: true });
        } catch (linkError: any) {
          console.error('Error linking accounts:', linkError);
          toast.error('Failed to link accounts: ' + linkError.message);
        }
      } else {
        console.error('Email mismatch:', { expected: email, received: result.user.email });
        toast.error('Please use the same Google account that matches your GitHub email.');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in popup was closed. Please try again.');
      } else {
        toast.error('Failed to link accounts: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email || !pendingCred) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Link Your Accounts
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            We noticed you're trying to sign in with GitHub using an email ({email})
            that's already associated with a Google account. To continue, you'll need
            to link these accounts.
          </Alert>

          <Typography variant="body1" paragraph>
            To link your accounts:
          </Typography>
          <Typography component="ol" sx={{ mb: 3 }}>
            <li>Click the "Sign in with Google" button below</li>
            <li>Sign in with your Google account that uses {email}</li>
            <li>Your accounts will be automatically linked</li>
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign in with Google to Link Accounts
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Cancel
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 