import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Paper,
  Tab,
  Tabs,
  Container,
} from '@mui/material';
import {
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ActivityFeed from './ActivityFeed';
import ProgressTracking from './ProgressTracking';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface UserProfile {
  username: string;
  photoURL: string | null;
  totalPoints: number;
  rank: string;
  achievements: string[];
  followers: string[];
  following: string[];
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Profile: React.FC = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', userId || currentUser?.uid || '');
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            username: data.username || '',
            photoURL: data.photoURL || null,
            totalPoints: data.progress?.totalPoints || 0,
            rank: data.rank || 'Beginner',
            achievements: data.achievements || [],
            followers: data.followers || [],
            following: data.following || [],
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [userId, currentUser]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={profile.photoURL || undefined}
              alt={profile.username}
              sx={{ width: 100, height: 100 }}
            >
              {profile.username ? profile.username[0].toUpperCase() : '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {profile.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={<TrophyIcon />}
                  label={`${profile.totalPoints} points`}
                  color="primary"
                />
                <Chip
                  icon={<PersonIcon />}
                  label={profile.rank}
                  color="secondary"
                />
                <Chip
                  icon={<PeopleIcon />}
                  label={`${profile.followers.length} followers`}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Progress" />
          <Tab label="Activity" />
          <Tab label="Achievements" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <ProgressTracking userId={userId || currentUser?.uid || ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ActivityFeed userId={userId || currentUser?.uid || ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}>
          {profile.achievements.map((achievement) => (
            <Card key={achievement}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrophyIcon color="primary" />
                  <Typography variant="h6">{achievement}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>
    </Container>
  );
};

export default Profile; 