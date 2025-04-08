import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector } from 'react-redux';
import { RootState } from './store/types';
import ActivityFeed from './components/ActivityFeed';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Leaderboard from './components/Leaderboard';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/Admin/Dashboard';
import Challenges from './components/Challenges';
import ChallengeSolver from './pages/ChallengeSolver';
import ChallengeDetails from './components/ChallengeDetails';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import VerifyEmail from './components/VerifyEmail';
import Discussions from './pages/Discussions';
import DiscussionView from './pages/DiscussionView';
import CreateDiscussion from './pages/CreateDiscussion';
import Bookmarks from './pages/Bookmarks';
import ErrorBoundary from './components/ErrorBoundary';
import AdminOverview from './components/Admin/AdminOverview';
import AdminChallenges from './components/Admin/ChallengeManager';
import AdminAnalytics from './components/Admin/ChallengeAnalytics';
import AdminUsers from './components/Admin/UserManager';
import { ChallengesProvider } from './contexts/ChallengesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import { UseLocalStorageDemo } from './components/useLocalStorageDemo';

// Wrapper component to handle auth-based redirects
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <Box sx={{ width: '100%', position: 'fixed', top: 0, zIndex: 2000 }}>
        <LinearProgress />
      </Box>
    );
  }

  // If no user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is not verified, redirect to verify email page
  if (!currentUser.emailVerified && window.location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

// Separate component for the main app content
const AppContent: React.FC = () => {
  const { loading, currentUser } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <Box sx={{ width: '100%', position: 'fixed', top: 0, zIndex: 2000 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          pt: { xs: 2, sm: 3 },
          pb: { xs: 4, sm: 5 },
        }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected routes that require verification */}
          <Route path="/" element={
            <AuthWrapper>
              {currentUser && <ActivityFeed userId={currentUser.uid} />}
            </AuthWrapper>
          } />
          <Route path="/challenges" element={
            <AuthWrapper>
              <Challenges />
            </AuthWrapper>
          } />
          <Route path="/challenge/:challengeId" element={
            <AuthWrapper>
              <ChallengeDetails />
            </AuthWrapper>
          } />
          <Route path="/challenge/:challengeId/solve" element={
            <AuthWrapper>
              <ChallengeSolver />
            </AuthWrapper>
          } />
          <Route path="/leaderboard" element={
            <AuthWrapper>
              <Leaderboard />
            </AuthWrapper>
          } />
          <Route path="/profile" element={
            <AuthWrapper>
              <Profile />
            </AuthWrapper>
          } />
          <Route path="/profile/:userId" element={
            <AuthWrapper>
              <Profile />
            </AuthWrapper>
          } />
          <Route path="/profile/edit" element={
            <AuthWrapper>
              <ProfileEdit />
            </AuthWrapper>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AuthWrapper>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </AuthWrapper>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="challenges" element={<AdminChallenges />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Discussions routes */}
          <Route path="/discussions" element={
            <AuthWrapper>
              <Discussions />
            </AuthWrapper>
          } />
          <Route path="/discussions/:id" element={
            <AuthWrapper>
              <DiscussionView />
            </AuthWrapper>
          } />
          <Route path="/discussions/new" element={
            <AuthWrapper>
              <CreateDiscussion />
            </AuthWrapper>
          } />

          {/* Bookmarks route */}
          <Route path="/bookmarks" element={
            <AuthWrapper>
              <Bookmarks />
            </AuthWrapper>
          } />

          {/* Demo routes */}
          <Route path="/demo/local-storage" element={<UseLocalStorageDemo />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <CssBaseline />
          <AuthProvider>
            <ChallengesProvider>
              <Router>
                <AppContent />
              </Router>
            </ChallengesProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
