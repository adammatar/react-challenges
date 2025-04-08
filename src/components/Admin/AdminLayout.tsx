import { ReactNode } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

// List of admin email addresses
const ADMIN_EMAILS = [
  'mtadam.com@gmail.com',
  // Add other admin emails here
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Check if user's email is in the admin list or contains 'admin'
  const isAdmin = currentUser?.email && (
    ADMIN_EMAILS.includes(currentUser.email) || 
    currentUser.email.includes('admin')
  );

  if (!isAdmin) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography paragraph>
          You do not have permission to access this area.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {children}
    </Box>
  );
};

export default AdminLayout; 