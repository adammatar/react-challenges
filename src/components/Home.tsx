import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to React Challenges
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Master React by solving real-world coding challenges
        </Typography>

        {currentUser ? (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Welcome back, {currentUser.email}!
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/challenges"
                size="large"
              >
                View Challenges
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/profile"
                size="large"
              >
                My Profile
              </Button>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="body1" paragraph>
              Join our community of developers and improve your React skills through
              hands-on challenges. Track your progress, earn certificates, and showcase
              your achievements.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
                size="large"
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/register"
                size="large"
              >
                Register
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
} 