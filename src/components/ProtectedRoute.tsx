import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = false,
  requireUnauth = false,
  requireVerified = true
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (requireAuth && !currentUser) {
    // Redirect to login if authentication is required but user is not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireUnauth && currentUser) {
    // If user is logged in but not verified, allow them to access only verification page
    if (!currentUser.emailVerified && location.pathname === '/verify-email') {
      return <>{children}</>;
    }
    // Redirect to home if user is logged in but tries to access login/register pages
    return <Navigate to="/" replace />;
  }

  if (requireVerified && currentUser && !currentUser.emailVerified) {
    // Allow access to verification page
    if (location.pathname === '/verify-email') {
      return <>{children}</>;
    }
    // Redirect to verification page if email is not verified
    return <Navigate 
      to="/verify-email" 
      state={{ 
        email: currentUser.email,
        from: location.pathname
      }} 
      replace 
    />;
  }

  return <>{children}</>;
} 