import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  Link,
  Grid,
  Divider,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { 
  GithubAuthProvider, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  AuthCredential
} from 'firebase/auth';
import { setUser } from '../store/slices/authSlice';
import { toSerializableUser } from '../utils/auth';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = getAuth();

  const handleChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
          } 
        });
        return;
      }

      dispatch(setUser(toSerializableUser(userCredential.user)));
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else {
        toast.error('Failed to log in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      dispatch(setUser(toSerializableUser(result.user)));
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      const githubProvider = new GithubAuthProvider();
      
      try {
        const result = await signInWithPopup(auth, githubProvider);
        dispatch(setUser(toSerializableUser(result.user)));
        toast.success('Successfully logged in with GitHub!');
        navigate('/');
      } catch (error: any) {
        console.log('GitHub sign-in error:', error.code, error);
        
        if (error.code === 'auth/account-exists-with-different-credential') {
          const email = error.customData?.email;
          const pendingCred = GithubAuthProvider.credentialFromError(error) as AuthCredential;
          
          if (!email || !pendingCred) {
            console.error('Missing data:', { email, pendingCred });
            throw new Error('Missing email or GitHub credentials');
          }

          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log('Available sign-in methods:', methods);
          
          if (methods.includes('google.com')) {
            console.log('Redirecting to link accounts with data:', { email, pendingCred });
            navigate('/link-accounts', {
              state: {
                email,
                pendingCred: JSON.parse(JSON.stringify(pendingCred))
              },
              replace: true
            });
            return;
          } else {
            toast.error('This email is already registered with a different method');
          }
        } else if (error.code === 'auth/popup-closed-by-user') {
          toast.error('Sign-in popup was closed. Please try again.');
        } else {
          console.error('Unexpected error:', error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Failed to log in with GitHub');
    } finally {
      setLoading(false);
    }
  };

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
          width: '100%',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.shadows[6],
        }}
      >
        <Avatar
          sx={{
            m: 1,
            bgcolor: 'secondary.main',
            width: 56,
            height: 56,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleEmailSignIn} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange('email')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={formData.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Sign In
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
          <Divider sx={{ mb: 2 }}>OR</Divider>
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{
                py: 1.5,
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              }}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGithubSignIn}
              disabled={loading}
              startIcon={<GitHubIcon />}
              sx={{
                py: 1.5,
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              }}
            >
              Sign in with GitHub
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
} 