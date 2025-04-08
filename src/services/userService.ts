import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, UserProgress } from '../types/user';

const AUTOSAVE_DEBOUNCE_MS = 1000; // 1 second

export const createUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
  const userRef = doc(db, 'users', userId);
  const now = Date.now();
  
  const newProfile: UserProfile = {
    id: userId,
    email,
    progress: {
      completedChallenges: {},
      inProgressChallenges: {},
      totalPoints: 0,
    },
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userRef, newProfile);
  return newProfile;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const saveProgress = async (
  userId: string,
  challengeId: string,
  code: string,
  isCompleted: boolean,
  points?: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const updates: any = {};

    if (isCompleted) {
      updates[`progress.completedChallenges.${challengeId}`] = {
        code,
        completedAt: new Date().toISOString(),
        timeSpent: 0 // This should be calculated based on the timer
      };
      if (points) {
        updates.points = increment(points);
      }
    } else {
      updates[`progress.inProgressChallenges.${challengeId}`] = {
        code,
        lastUpdated: new Date().toISOString()
      };
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
};

export const initializeUserProgress = async (userId: string): Promise<void> => {
  console.log('Starting initializeUserProgress for user:', userId);
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error('User document not found in Firestore');
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  console.log('Current user data:', userData);
  
  // Only initialize if progress doesn't exist
  if (!userData.progress) {
    console.log('Progress not found, initializing...');
    await updateDoc(userRef, {
      progress: {
        completedChallenges: {},
        inProgressChallenges: {},
        totalPoints: 0,
      },
      updatedAt: serverTimestamp(),
    });
    console.log('Progress initialized successfully');
  } else {
    console.log('Progress already exists:', userData.progress);
  }
};

// Debounce helper function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

// Create a debounced version of saveProgress for auto-saving
export const autoSaveProgress = debounce(saveProgress, AUTOSAVE_DEBOUNCE_MS); 