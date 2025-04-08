import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  styled,
  alpha,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  Code as CodeIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as TrendingIcon,
  Group as CommunityIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
  RocketLaunch as RocketIcon,
  Assignment as ChallengeIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Forum as ForumIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { User as FirebaseAuthUser } from 'firebase/auth';

interface Activity {
  id: string;
  type: 'completion' | 'achievement' | 'comment' | 'join' | 'follow' | 'discussion';
  userId: string;
  username: string;
  userPhoto: string | null;
  targetUserId?: string;
  challengeId?: string;
  challengeName?: string;
  achievementName?: string;
  comment?: string;
  discussionId?: string;
  discussionTitle?: string;
  discussionContent?: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

interface User {
  id: string;
  username: string;
  photoURL: string | null;
  bio: string;
  followers: number;
}

interface FirestoreUserData {
  displayName: string | null;
  username: string;
  photoURL: string | null;
  email: string;
  following?: string[];
  followers: number;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  completions: number;
}

interface ActivityFeedProps {
  userId: string;
}

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchFollowingStatus = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const following = userDoc.data()?.following || [];
      const newFollowingMap: Record<string, boolean> = {};
      following.forEach((userId: string) => {
        newFollowingMap[userId] = true;
      });
      setFollowingMap(newFollowingMap);
    } catch (error) {
      console.error('Error fetching following status:', error);
    }
  }, [currentUser]);

  const handleFollow = useCallback(async (userId: string) => {
    if (!currentUser) return;
    try {
      const isFollowing = followingMap[userId];
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', userId);

      // Update current user's following list
      await updateDoc(userRef, {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId)
      });

      // Update target user's followers count
      await updateDoc(targetUserRef, {
        followers: increment(isFollowing ? -1 : 1)
      });

      // Update local state
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !isFollowing
      }));

      // Update users list to reflect new follower count
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, followers: user.followers + (isFollowing ? -1 : 1) }
            : user
        )
      );

      // Create activity if following (not when unfollowing)
      if (!isFollowing) {
        const activityRef = collection(db, 'activities');
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() as FirestoreUserData;
        await addDoc(activityRef, {
          type: 'follow',
          userId: currentUser.uid,
          username: userData.username,
          userPhoto: userData.photoURL,
          targetUserId: userId,
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [currentUser, followingMap]);

  useEffect(() => {
    if (currentUser) {
      fetchFollowingStatus();
    }
  }, [currentUser, fetchFollowingStatus]);

  const searchUsers = useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<User, 'id'>),
        })) as User[];

      setUsers(usersData.filter(user => user.id !== currentUser?.uid));
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, searchUsers]);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Find Users to Follow
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <List>
          {loading ? (
            [...Array(2)].map((_, i) => (
              <ListItem key={i}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ListItem>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <ListItem 
                key={user.id}
                sx={{
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.photoURL || undefined}>
                    {user.username[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  secondary={`${user.followers} followers`}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    variant={followingMap[user.id] ? "outlined" : "contained"}
                    startIcon={followingMap[user.id] ? undefined : <PersonAddIcon />}
                    onClick={() => handleFollow(user.id)}
                    color={followingMap[user.id] ? "inherit" : "primary"}
                  >
                    {followingMap[user.id] ? 'Following' : 'Follow'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : searchQuery && (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No users found
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
    }}
  >
    <RocketIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
    <Typography variant="h5" gutterBottom fontWeight="bold">
      No Activities Yet
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
      Be the first to make a mark! Start by taking on a coding challenge or joining the community discussions.
    </Typography>
    <Stack direction="row" spacing={2} justifyContent="center">
      <Button
        variant="contained"
        startIcon={<ChallengeIcon />}
        onClick={() => window.location.href = '/challenges'}
      >
        Browse Challenges
      </Button>
      <Button
        variant="outlined"
        startIcon={<ForumIcon />}
        onClick={() => window.location.href = '/discussions'}
      >
        Join Discussions
      </Button>
    </Stack>
  </Box>
);

const ActivityItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  background: theme.palette.background.paper,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const ActivityAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  marginRight: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>({});
  const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchFollowingStatus = useCallback(async (userIds: string[]) => {
    if (!currentUser) return;
    try {
      const statuses = await Promise.all(
        userIds.map(async (uid) => {
          const followingRef = doc(db, `users/${currentUser.uid}/following/${uid}`);
          const followingDoc = await getDoc(followingRef);
          return { [uid]: followingDoc.exists() };
        })
      );
      setIsFollowing(Object.assign({}, ...statuses));
    } catch (error) {
      console.error('Error fetching following status:', error);
    }
  }, [currentUser]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const usersRef = collection(db, 'users');
      const q = query.toLowerCase();
      const querySnapshot = await getDocs(usersRef);
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => 
          user.username?.toLowerCase().includes(q) ||
          user.displayName?.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Activity[];

      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleActivityClick = useCallback((activity: Activity) => {
    if (activity.challengeId) {
      navigate(`/challenge/${activity.challengeId}`);
    } else if (activity.discussionId) {
      navigate(`/discussion/${activity.discussionId}`);
    } else if (activity.type === 'follow' && activity.targetUserId) {
      navigate(`/profile/${activity.targetUserId}`);
    }
  }, [navigate]);

  const getActivityContent = useCallback((activity: Activity) => {
    switch (activity.type) {
      case 'completion':
        return `completed the challenge "${activity.challengeName}"`;
      case 'achievement':
        return `earned the achievement "${activity.achievementName}"`;
      case 'comment':
        return `commented on "${activity.challengeName}"`;
      case 'join':
        return 'joined the platform';
      case 'follow':
        return `started following ${activity.username}`;
      case 'discussion':
        return `posted a new discussion: "${activity.discussionTitle}"`;
      default:
        return '';
    }
  }, []);

  const renderPopularChallenges = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Popular Challenges
      </Typography>
      <List>
        {popularChallenges.map((challenge) => (
          <ListItem
            key={challenge.id}
            button
            onClick={() => navigate(`/challenge/${challenge.id}`)}
          >
            <ListItemAvatar>
              <Avatar>
                <ChallengeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={challenge.title}
              secondary={`${challenge.completions} completions`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Main Activity Feed */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            color: 'transparent',
            mb: 4,
          }}>
            Activity Feed
          </Typography>
          
          {loading ? (
            <Stack spacing={2}>
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="90%" />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : activities.length === 0 ? (
            <EmptyState />
          ) : (
            <Stack spacing={2}>
              {activities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  elevation={0}
                  onClick={() => handleActivityClick(activity)}
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                      bgcolor: `${theme.palette.primary.main}05`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ActivityAvatar src={activity.userPhoto || undefined}>
                      {activity.username[0].toUpperCase()}
                    </ActivityAvatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {activity.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {getActivityContent(activity)}
                      </Typography>
                    </Box>
                  </Box>
                </ActivityItem>
              ))}
            </Stack>
          )}
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: isMobile ? '100%' : 320 }}>
          {/* User Search */}
          <UserSearch />

          {/* Trending Challenges */}
          <Card 
            sx={{ 
              bgcolor: 'background.paper',
              backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
              mb: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Trending Challenges
                </Typography>
              </Box>
              <Stack spacing={2}>
                {popularChallenges.map((challenge) => (
                  <Box 
                    key={challenge.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                  >
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      {challenge.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={challenge.difficulty} 
                        size="small"
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {challenge.completions} completions
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/challenges')}
                sx={{ mt: 3 }}
              >
                View All Challenges
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Your Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrophyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Challenges Completed
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ mt: 1 }}
              >
                View Full Progress
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ActivityFeed;