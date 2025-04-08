import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  Alert,
  Badge,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Code as CodeIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useChallenges } from '../contexts/ChallengesContext';
import { Challenge } from '../types/challenge';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
type SortOption = 'level' | 'title' | 'points';
type Category = 'all' | 'state' | 'hooks' | 'performance' | 'testing' | 'animation' | 'patterns' | 'ssr' | 'pwa' | 'auth' | 'i18n' | 'a11y' | 'visualization' | 'mobile' | 'typescript' | 'graphql' | 'string';

const difficultyColors: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  expert: 'error',
};

const difficultyStyles: Record<Difficulty, { color: string, background: string }> = {
  beginner: {
    color: '#4CAF50',
    background: '#E8F5E9',
  },
  intermediate: {
    color: '#FF9800',
    background: '#FFF3E0',
  },
  expert: {
    color: '#f44336',
    background: '#FFEBEE',
  },
};

const difficultyIcons: Record<Difficulty, string> = {
  beginner: '🌱',
  intermediate: '⚡',
  expert: '🔥',
};

const ITEMS_PER_PAGE = 12;

const Challenges = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { challenges, loading, error } = useChallenges();
  const { currentUser } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('level');
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch completed challenges
  useEffect(() => {
    console.log('Fetching completed challenges...');
    console.log('Current user:', currentUser?.uid);
    
    const fetchCompletedChallenges = async () => {
      if (!currentUser) {
        console.log('No user logged in');
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          const completed = userData.completedChallenges || {};
          console.log('Completed challenges:', completed);
          setCompletedChallenges(completed);
        } else {
          console.log('User document not found');
        }
      } catch (error) {
        console.error('Error fetching completed challenges:', error);
      }
    };

    fetchCompletedChallenges();
  }, [currentUser]);

  // Log when challenges or completed challenges change
  useEffect(() => {
    console.log('All challenges:', challenges);
    console.log('Completed challenges:', completedChallenges);
    
    const completedCount = Object.keys(completedChallenges).length;
    console.log(`User has completed ${completedCount} challenges`);
    
    challenges.forEach(challenge => {
      if (completedChallenges[challenge.id]) {
        console.log(`Challenge "${challenge.title}" (${challenge.id}) is completed`);
      }
    });
  }, [challenges, completedChallenges]);

  // Filter and sort challenges
  const filteredChallenges = useCallback(() => {
    let result = [...challenges];

    // Apply search filter
    if (debouncedSearch) {
      result = result.filter(challenge => 
        challenge.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        challenge.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (difficulty !== 'all') {
      result = result.filter(challenge => challenge.difficulty === difficulty);
    }

    // Apply category filter
    if (category !== 'all') {
      result = result.filter(challenge => challenge.category === category);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'points':
          return b.points - a.points;
        case 'level':
        default:
          const difficultyOrder = { beginner: 0, intermediate: 1, expert: 2 };
          return difficultyOrder[a.difficulty as Difficulty] - difficultyOrder[b.difficulty as Difficulty];
      }
    });

    return result;
  }, [challenges, debouncedSearch, difficulty, category, sortBy]);

  // Update displayed challenges when filters change
  useEffect(() => {
    setPage(1);
    const initialChallenges = filteredChallenges().slice(0, ITEMS_PER_PAGE);
    setDisplayedChallenges(initialChallenges);
    setHasMore(initialChallenges.length < filteredChallenges().length);
  }, [filteredChallenges]);

  // Load more challenges when scrolling
  useEffect(() => {
    if (inView && !loading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const newChallenges = filteredChallenges().slice(0, nextPage * ITEMS_PER_PAGE);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        setDisplayedChallenges(newChallenges);
        setPage(nextPage);
        setIsLoadingMore(false);
        setHasMore(newChallenges.length < filteredChallenges().length);
      }, 500);
    }
  }, [inView, loading, page, filteredChallenges, isLoadingMore, hasMore]);

  // Calculate completion percentage
  const calculateCompletionPercentage = (challenge: Challenge) => {
    return Math.min((challenge.completedBy / 100) * 100, 100);
  };

  // Get skill level based on points
  const getSkillLevel = (points: number) => {
    if (points >= 100) return 'Advanced';
    if (points >= 50) return 'Intermediate';
    return 'Beginner';
  };

  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
          }}
        >
          React Challenges
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ 
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
          }}
        >
          Master React development through hands-on challenges. Each challenge is designed to test and improve your skills in different aspects of React development.
        </Typography>
        
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                textAlign: 'center',
              }}
            >
              <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {challenges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Challenges
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                textAlign: 'center',
              }}
            >
              <GroupIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {challenges.reduce((acc, curr) => acc + curr.completedBy, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Completions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                textAlign: 'center',
              }}
            >
              <LightbulbIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {challenges.reduce((acc, curr) => acc + curr.points, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Points Available
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {error && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        </Box>
      )}
      
      {/* Filters */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.grey[50], 0.8),
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'all' | Difficulty)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="beginner">🌱 Beginner</MenuItem>
              <MenuItem value="intermediate">⚡ Intermediate</MenuItem>
              <MenuItem value="expert">🔥 Expert</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="state">State Management</MenuItem>
              <MenuItem value="hooks">Hooks</MenuItem>
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="testing">Testing</MenuItem>
              <MenuItem value="animation">Animation</MenuItem>
              <MenuItem value="patterns">Patterns</MenuItem>
              <MenuItem value="ssr">SSR</MenuItem>
              <MenuItem value="pwa">PWA</MenuItem>
              <MenuItem value="auth">Auth</MenuItem>
              <MenuItem value="i18n">i18n</MenuItem>
              <MenuItem value="a11y">Accessibility</MenuItem>
              <MenuItem value="visualization">Visualization</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="graphql">GraphQL</MenuItem>
              <MenuItem value="string">String</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="level">Level</MenuItem>
              <MenuItem value="title">A-Z</MenuItem>
              <MenuItem value="points">Points</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Challenge Grid */}
      <Grid container spacing={3}>
        {displayedChallenges.map((challenge) => (
          <Grid item xs={12} key={challenge.id}>
            <Card 
              sx={{ 
                transition: 'all 0.2s',
                background: completedChallenges[challenge.id] 
                  ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                  : 'inherit',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
              onClick={() => navigate(`/challenge/${challenge.id}`)}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        component="h2"
                        sx={{ 
                          fontWeight: 600,
                          flexGrow: 1,
                          color: completedChallenges[challenge.id] ? 'white' : 'inherit',
                        }}
                      >
                        {challenge.title}
                      </Typography>
                      {completedChallenges[challenge.id] && (
                        <Tooltip title="Completed">
                          <CheckCircleIcon sx={{ color: 'white' }} />
                        </Tooltip>
                      )}
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{difficultyIcons[challenge.difficulty as Difficulty]}</span>
                            <span style={{ textTransform: 'capitalize' }}>{challenge.difficulty}</span>
                          </Box>
                        }
                        size="small"
                        sx={{
                          bgcolor: completedChallenges[challenge.id] 
                            ? 'rgba(255, 255, 255, 0.2)'
                            : difficultyStyles[challenge.difficulty as Difficulty].background,
                          color: completedChallenges[challenge.id]
                            ? 'white'
                            : difficultyStyles[challenge.difficulty as Difficulty].color,
                          fontWeight: 500,
                          px: 1,
                          height: 28,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                          border: '1px solid',
                          borderColor: completedChallenges[challenge.id]
                            ? 'rgba(255, 255, 255, 0.3)'
                            : (theme) => alpha(difficultyStyles[challenge.difficulty as Difficulty].color, 0.2),
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                      }}
                    >
                      {challenge.description}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Tooltip title="Skill Level">
                        <Chip
                          icon={<LightbulbIcon sx={{ 
                            color: completedChallenges[challenge.id] ? 'white' : undefined 
                          }} />}
                          label={getSkillLevel(challenge.points)}
                          size="small"
                          sx={{
                            bgcolor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.2)' : undefined,
                            color: completedChallenges[challenge.id] ? 'white' : undefined,
                            borderColor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.3)' : undefined,
                          }}
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title="Category">
                        <Chip
                          icon={<CodeIcon sx={{ 
                            color: completedChallenges[challenge.id] ? 'white' : undefined 
                          }} />}
                          label={challenge.category}
                          size="small"
                          sx={{
                            bgcolor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.2)' : undefined,
                            color: completedChallenges[challenge.id] ? 'white' : undefined,
                            borderColor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.3)' : undefined,
                          }}
                          variant="outlined"
                        />
                      </Tooltip>
                    </Stack>
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary' 
                        }}>
                          Completion Rate
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary' 
                        }}>
                          {calculateCompletionPercentage(challenge)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateCompletionPercentage(challenge)}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: completedChallenges[challenge.id] 
                            ? 'rgba(255, 255, 255, 0.2)'
                            : (theme) => alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: completedChallenges[challenge.id] ? 'white' : undefined,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: { xs: 'flex-start', md: 'flex-end' },
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: completedChallenges[challenge.id] ? 'white' : 'primary.main',
                      }}>
                        <StarIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {challenge.points} Points
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                      }}>
                        <TimeIcon />
                        <Typography variant="body2">
                          {challenge.estimatedTime}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                      }}>
                        <CheckCircleIcon />
                        <Typography variant="body2">
                          {challenge.completedBy} completed
                        </Typography>
                      </Box>
                      <Button
                        variant={completedChallenges[challenge.id] ? "outlined" : "contained"}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ 
                          mt: 2,
                          textTransform: 'none',
                          fontWeight: 500,
                          bgcolor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.2)' : undefined,
                          color: completedChallenges[challenge.id] ? 'white' : undefined,
                          borderColor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.3)' : undefined,
                          '&:hover': {
                            bgcolor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.3)' : undefined,
                            borderColor: completedChallenges[challenge.id] ? 'rgba(255, 255, 255, 0.4)' : undefined,
                          }
                        }}
                      >
                        {completedChallenges[challenge.id] ? 'Review Solution' : 'Start Challenge'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Loading indicator for infinite scroll */}
      <Box 
        ref={ref} 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          my: 4,
          minHeight: 100,
          alignItems: 'center',
        }}
      >
        {isLoadingMore ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
          }}>
            <CircularProgress size={40} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              Loading more challenges...
            </Typography>
          </Box>
        ) : hasMore ? (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Scroll down to load more
          </Typography>
        ) : displayedChallenges.length > 0 ? (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon fontSize="small" />
            You've reached the end of the challenges
          </Typography>
        ) : null}
      </Box>

      {/* No Results */}
      {displayedChallenges.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 4,
          borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        }}>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            No challenges found matching your criteria.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Challenges; 