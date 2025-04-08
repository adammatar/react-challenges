import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { Code as CodeIcon, EmojiEvents as TrophyIcon, School as SchoolIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <CodeIcon fontSize="large" />,
      title: 'Practice React',
      description: 'Enhance your React skills with our curated collection of coding challenges.',
    },
    {
      icon: <TrophyIcon fontSize="large" />,
      title: 'Compete',
      description: 'Solve challenges, earn points, and compete with developers worldwide.',
    },
    {
      icon: <SchoolIcon fontSize="large" />,
      title: 'Learn',
      description: 'Progress from beginner to expert level with structured learning paths.',
    },
  ];

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 8, mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          React Coding Challenges
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Master React through hands-on practice with real-world coding challenges
        </Typography>
        <Box sx={{ mt: 4 }}>
          {currentUser ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/challenges')}
            >
              Start Coding
            </Button>
          ) : (
            <Box sx={{ '& > button': { mx: 1 } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary">{feature.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Why Choose Our Platform?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          • Interactive coding environment with real-time feedback<br />
          • Comprehensive test cases to validate your solutions<br />
          • Progress tracking and performance analytics<br />
          • Earn certificates for completing challenge levels<br />
          • Share your achievements on LinkedIn<br />
          • Join a community of React developers
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 