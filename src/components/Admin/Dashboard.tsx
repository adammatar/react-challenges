import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Challenges', icon: <CodeIcon />, path: '/admin/challenges' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState(location.pathname);

  const handleMenuClick = (path: string) => {
    setSelectedPath(path);
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <List>
          <ListItem>
            <Typography variant="h6" sx={{ py: 2 }}>
              Admin Panel
            </Typography>
          </ListItem>
          <Divider />
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={selectedPath === item.path}
              onClick={() => handleMenuClick(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
} 