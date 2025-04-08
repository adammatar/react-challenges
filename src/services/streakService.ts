import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
}

export const getStreakData = async (userId: string): Promise<StreakData> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  return {
    currentStreak: userData?.streak?.currentStreak || 0,
    longestStreak: userData?.streak?.longestStreak || 0,
    lastActivityDate: userData?.streak?.lastActivityDate || null,
    streakStartDate: userData?.streak?.streakStartDate || null,
  };
};

export const updateStreak = async (userId: string): Promise<StreakData> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastActivityDate = userData?.streak?.lastActivityDate;
  
  let currentStreak = userData?.streak?.currentStreak || 0;
  let longestStreak = userData?.streak?.longestStreak || 0;
  let streakStartDate = userData?.streak?.streakStartDate;

  if (!lastActivityDate) {
    // First activity
    currentStreak = 1;
    longestStreak = 1;
    streakStartDate = today;
  } else {
    const lastDate = new Date(lastActivityDate);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActivityDate === today) {
      // Already logged activity today
      return {
        currentStreak,
        longestStreak,
        lastActivityDate,
        streakStartDate,
      };
    } else if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      // Consecutive day
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // Streak broken
      currentStreak = 1;
      streakStartDate = today;
    }
  }

  // Update streak data in Firestore
  await updateDoc(userRef, {
    streak: {
      currentStreak,
      longestStreak,
      lastActivityDate: today,
      streakStartDate,
      updatedAt: serverTimestamp(),
    },
  });

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: today,
    streakStartDate,
  };
};

export const checkStreakMilestone = (currentStreak: number): string | null => {
  const milestones = {
    3: '3-Day Streak! Keep it up!',
    7: 'One Week Warrior!',
    14: 'Two Week Champion!',
    30: 'Monthly Master!',
    50: 'Unstoppable!',
    100: 'Legendary Dedication!',
  };

  return milestones[currentStreak as keyof typeof milestones] || null;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return '🔥🏆';
  if (streak >= 50) return '🔥💫';
  if (streak >= 30) return '🔥⭐';
  if (streak >= 14) return '🔥🌟';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '🌱';
}; 