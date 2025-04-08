import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progress' | 'streak' | 'community' | 'speed' | 'special';
  icon: string;
  condition: string;
  points: number;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Progress Achievements
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first challenge',
    category: 'progress',
    icon: '🎯',
    condition: 'Complete 1 challenge',
    points: 10,
  },
  {
    id: 'beginner-master',
    title: 'Beginner Master',
    description: 'Complete all beginner challenges',
    category: 'progress',
    icon: '🌟',
    condition: 'Complete all beginner challenges',
    points: 50,
  },
  {
    id: 'intermediate-master',
    title: 'Intermediate Master',
    description: 'Complete all intermediate challenges',
    category: 'progress',
    icon: '⭐',
    condition: 'Complete all intermediate challenges',
    points: 100,
  },
  {
    id: 'expert-master',
    title: 'Expert Master',
    description: 'Complete all expert challenges',
    category: 'progress',
    icon: '🏆',
    condition: 'Complete all expert challenges',
    points: 200,
  },
  
  // Streak Achievements
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    category: 'streak',
    icon: '✨',
    condition: '3-day streak',
    points: 20,
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    icon: '🔥',
    condition: '7-day streak',
    points: 50,
  },
  {
    id: 'monthly-master',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    icon: '🌟',
    condition: '30-day streak',
    points: 200,
  },
  
  // Speed Achievements
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete a challenge in under 10 minutes',
    category: 'speed',
    icon: '⚡',
    condition: 'Complete challenge < 10min',
    points: 30,
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Complete 5 challenges in one day',
    category: 'speed',
    icon: '🚀',
    condition: '5 challenges in 1 day',
    points: 50,
  },
  
  // Community Achievements
  {
    id: 'helpful-hand',
    title: 'Helpful Hand',
    description: 'Help another user with a challenge',
    category: 'community',
    icon: '🤝',
    condition: 'Help 1 user',
    points: 20,
  },
  {
    id: 'community-leader',
    title: 'Community Leader',
    description: 'Help 10 users with challenges',
    category: 'community',
    icon: '👑',
    condition: 'Help 10 users',
    points: 100,
  },
  
  // Special Achievements
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Complete a challenge with all test cases passing on first try',
    category: 'special',
    icon: '💯',
    condition: 'All tests pass first try',
    points: 50,
  },
  {
    id: 'challenge-master',
    title: 'Challenge Master',
    description: 'Complete all challenges in all difficulty levels',
    category: 'special',
    icon: '🎖️',
    condition: 'Complete all challenges',
    points: 500,
  },
];

export const getAchievements = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const unlockedAchievements = userData?.achievements || {};

  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: !!unlockedAchievements[achievement.id],
    unlockedAt: unlockedAchievements[achievement.id]?.unlockedAt || null,
  }));
};

export const unlockAchievement = async (userId: string, achievementId: string) => {
  const userRef = doc(db, 'users', userId);
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  
  if (!achievement) {
    throw new Error('Achievement not found');
  }

  await updateDoc(userRef, {
    [`achievements.${achievementId}`]: {
      unlockedAt: new Date().toISOString(),
      points: achievement.points,
    },
    totalPoints: achievement.points,
    updatedAt: serverTimestamp(),
  });

  return achievement;
};

export const checkProgressAchievements = async (
  userId: string,
  completedChallenges: Record<string, any>,
  difficulty: 'beginner' | 'intermediate' | 'expert'
) => {
  const difficultyMap = {
    beginner: 'beginner-master',
    intermediate: 'intermediate-master',
    expert: 'expert-master',
  };

  const achievementId = difficultyMap[difficulty];
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  // Check if this is the first completed challenge
  if (Object.keys(completedChallenges).length === 1 && !userData?.achievements?.['first-steps']) {
    await unlockAchievement(userId, 'first-steps');
  }

  // Check if all challenges of this difficulty are completed
  const challengesQuery = await getDoc(doc(db, 'challenges', difficulty));
  const totalChallenges = challengesQuery.data()?.count || 0;
  
  if (Object.keys(completedChallenges).length === totalChallenges) {
    await unlockAchievement(userId, achievementId);
  }

  // Check for Challenge Master achievement
  const allChallengesCompleted = userData?.progress?.completedChallenges || {};
  const totalAllChallenges = await getDoc(doc(db, 'challenges', 'total'));
  
  if (Object.keys(allChallengesCompleted).length === totalAllChallenges.data()?.count) {
    await unlockAchievement(userId, 'challenge-master');
  }
};

export const checkSpeedAchievement = async (
  userId: string,
  completionTime: number,
  dailyCompletions: number
) => {
  // Check for Speed Demon (completion under 10 minutes)
  if (completionTime < 10 * 60 * 1000) {
    await unlockAchievement(userId, 'speed-demon');
  }

  // Check for Quick Learner (5 challenges in one day)
  if (dailyCompletions >= 5) {
    await unlockAchievement(userId, 'quick-learner');
  }
};

export const checkStreakAchievements = async (userId: string, currentStreak: number) => {
  const streakAchievements = {
    3: 'streak-starter',
    7: 'week-warrior',
    30: 'monthly-master',
  };

  if (streakAchievements[currentStreak as keyof typeof streakAchievements]) {
    await unlockAchievement(userId, streakAchievements[currentStreak as keyof typeof streakAchievements]);
  }
};

export const updateCommunityAchievements = async (userId: string, helpedUsers: number) => {
  if (helpedUsers === 1) {
    await unlockAchievement(userId, 'helpful-hand');
  }
  if (helpedUsers === 10) {
    await unlockAchievement(userId, 'community-leader');
  }
}; 