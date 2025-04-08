import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Box,
  IconButton,
  Divider,
  Typography,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Home as HomeIcon,
  Leaderboard as LeaderboardIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/communityService';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentUser: {
    displayName: string;
    photoURL: string | null;
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, currentUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; displayName: string; photoURL: string | null }>>([]);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const menuItems = [
    { text: 'Activity Feed', icon: <HomeIcon />, path: '/' },
    { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Challenges', icon: <CodeIcon />, path: '/challenges' },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {currentUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={currentUser.photoURL || undefined}
              alt={currentUser.displayName}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="subtitle1">{currentUser.displayName}</Typography>
          </Box>
        )}
        
        <TextField
          fullWidth
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search users..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {searchResults.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Search Results
            </Typography>
            <List dense>
              {searchResults.map((user) => (
                <ListItem
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    <Avatar
                      src={user.photoURL || undefined}
                      alt={user.displayName}
                      sx={{ width: 24, height: 24 }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={user.displayName} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 