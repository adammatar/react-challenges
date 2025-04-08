import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import UsernameDialog from '../components/UsernameDialog';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '../store/slices/authSlice';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { photoURL?: string; displayName?: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLocalLoading] = useState(true);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();

  const createUserDocument = async (user: User, username?: string) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      username: username || user.displayName || user.email?.split('@')[0] || null,
      emailVerified: user.emailVerified,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      isAdmin: false,
      isBlocked: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      progress: {
        completedChallenges: {},
        inProgressChallenges: {},
        totalPoints: 0,
      },
    }, { merge: true });
  };

  const updateUserVerificationStatus = async (user: User) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      emailVerified: user.emailVerified
    }, { merge: true });
  };

  const signUp = async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name
    await updateFirebaseProfile(userCredential.user, {
      displayName: username
    });
    // Create user document in Firestore
    await createUserDocument(userCredential.user, username);
    return userCredential;
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Update last login
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, { 
      lastLogin: serverTimestamp(),
      emailVerified: userCredential.user.emailVerified
    }, { merge: true });
    return userCredential;
  };

  const handleSocialSignIn = async (credential: any, username?: string) => {
    const user = credential.user;
    if (!username && !user.displayName) {
      setPendingCredential(credential);
      setShowUsernameDialog(true);
      return null;
    }
    await createUserDocument(user, username);
    setPendingCredential(null);
    return credential;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return handleSocialSignIn(credential);
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    // Add GitHub OAuth credentials
    provider.setCustomParameters({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET
    });
    const credential = await signInWithPopup(auth, provider);
    return handleSocialSignIn(credential);
  };

  const handleUsernameSubmit = async (username: string) => {
    if (pendingCredential && pendingCredential.user) {
      await updateFirebaseProfile(pendingCredential.user, { displayName: username });
      await createUserDocument(pendingCredential.user, username);
      setShowUsernameDialog(false);
      setPendingCredential(null);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = async (data: { photoURL?: string; displayName?: string }) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Update Firebase Auth profile
      await updateFirebaseProfile(currentUser, data);
      
      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...(data.photoURL && { photoURL: data.photoURL }),
        ...(data.displayName && { displayName: data.displayName }),
      });

      // Force refresh the user object
      await refreshUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    
    try {
      // Force refresh the user's token
      await currentUser.reload();
      // Get the fresh user object
      const freshUser = auth.currentUser;
      if (freshUser) {
        setCurrentUser(freshUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update email verification status in Firestore whenever it changes
        await updateUserVerificationStatus(user);
        
        // Fetch user data including isAdmin status
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        // Create a serializable user object for Redux
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          isAdmin: userData?.isAdmin || false,
        };

        setCurrentUser(user);
        setIsAdmin(userData?.isAdmin || false);
        dispatch(setUser(serializableUser));
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        dispatch(setUser(null));
      }
      setLocalLoading(false);
      dispatch(setLoading(false));
    });

    return unsubscribe;
  }, [dispatch]);

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    logout,
    updateUserProfile,
    refreshUserData,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      <UsernameDialog
        open={showUsernameDialog}
        onClose={() => {
          setShowUsernameDialog(false);
          setPendingCredential(null);
        }}
        onSubmit={handleUsernameSubmit}
        defaultUsername={pendingCredential?.user?.email?.split('@')[0] || ''}
      />
    </AuthContext.Provider>
  );
}; 