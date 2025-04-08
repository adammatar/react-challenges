import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow';
  read: boolean;
  timestamp: Date;
  fromUserId: string;
  fromUsername: string;
  fromUserPhoto: string | null;
  discussionId?: string;
  discussionTitle?: string;
  commentContent?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { mode } = useAppTheme();

  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('toUserId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Notification[];
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    const notificationRef = doc(db, 'notifications', notification.id);
    await updateDoc(notificationRef, { read: true });

    // Navigate to the relevant discussion
    if (notification.discussionId) {
      navigate(`/discussions/${notification.discussionId}`);
    }
    handleClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'comment':
        return `commented on your discussion "${notification.discussionTitle}"`;
      case 'like':
        return `liked your discussion "${notification.discussionTitle}"`;
      case 'follow':
        return 'started following you';
      default:
        return '';
    }
  };

  return (
    <>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon sx={{ 
          color: 'inherit',
          fontSize: '1.5rem' 
        }} />
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem>
            <Typography color="text.secondary">No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  component="div"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={notification.fromUserPhoto || undefined}>
                      {notification.fromUsername[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography component="span">
                        <strong>{notification.fromUsername}</strong>
                        {' '}
                        {getNotificationText(notification)}
                      </Typography>
                    }
                    secondary={formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default Notifications; 