import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { challengesBackup } from '../data/challengesBackup';
import { Challenge } from '../types/challenge';

interface ChallengesContextType {
  challenges: Challenge[];
  loading: boolean;
  error: string | null;
  fetchChallenges: (difficulty?: string) => Promise<void>;
  addSubmission: (challengeId: string, code: string, passed: boolean) => Promise<void>;
}

const ChallengesContext = createContext<ChallengesContextType | null>(null);

export const useChallenges = () => {
  const context = useContext(ChallengesContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
};

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchChallenges = async (difficulty?: string) => {
    setLoading(true);
    setError(null);
    try {
      const challengesRef = collection(db, 'challenges');
      const q = difficulty && difficulty !== 'all'
        ? query(challengesRef, where('difficulty', '==', difficulty))
        : challengesRef;
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // If Firestore is empty, use backup data
        const filteredBackup = difficulty && difficulty !== 'all'
          ? challengesBackup.filter(challenge => challenge.difficulty === difficulty)
          : challengesBackup;
        setChallenges(filteredBackup);
        setError('No challenges found in Firestore. Using backup data.');
      } else {
        const challengesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[];
        setChallenges(challengesData);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      // Use backup data if Firestore fails
      const filteredBackup = difficulty && difficulty !== 'all'
        ? challengesBackup.filter(challenge => challenge.difficulty === difficulty)
        : challengesBackup;
      setChallenges(filteredBackup);
      setError('Failed to load challenges from Firestore. Using backup data.');
    } finally {
      setLoading(false);
    }
  };

  const addSubmission = async (challengeId: string, code: string, passed: boolean) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) throw new Error('User document not found');

      const submission = {
        challengeId,
        code,
        passed,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        submissions: arrayUnion(submission),
        ...(passed && {
          'progress.completedChallenges': {
            [challengeId]: true,
          },
        }),
      });
    } catch (err) {
      console.error('Error adding submission:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const value = {
    challenges,
    loading,
    error,
    fetchChallenges,
    addSubmission,
  };

  return (
    <ChallengesContext.Provider value={value}>
      {children}
    </ChallengesContext.Provider>
  );
}; 