import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  challenges: string[];
  prerequisites: string[];
  estimatedTime: string;
  category: string;
  skills: string[];
}

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  prerequisites: string[];
  completedBy: number;
  averageTime: number;
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'react-basics',
    title: 'React Fundamentals',
    description: 'Master the basics of React development',
    difficulty: 'beginner',
    challenges: ['counter-app', 'todo-list', 'user-profile'],
    prerequisites: [],
    estimatedTime: '2 weeks',
    category: 'fundamentals',
    skills: ['JSX', 'Components', 'State', 'Props'],
  },
  {
    id: 'react-intermediate',
    title: 'React State Management',
    description: 'Learn advanced state management techniques',
    difficulty: 'intermediate',
    challenges: ['redux-todo', 'context-theme', 'global-state'],
    prerequisites: ['react-basics'],
    estimatedTime: '3 weeks',
    category: 'state-management',
    skills: ['Redux', 'Context', 'State Patterns'],
  },
  {
    id: 'react-advanced',
    title: 'React Performance',
    description: 'Master React performance optimization',
    difficulty: 'expert',
    challenges: ['memo-optimization', 'lazy-loading', 'virtualization'],
    prerequisites: ['react-intermediate'],
    estimatedTime: '4 weeks',
    category: 'performance',
    skills: ['Optimization', 'Code Splitting', 'Profiling'],
  },
];

export const getLearningPaths = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const completedChallenges = userData?.progress?.completedChallenges || {};

  return LEARNING_PATHS.map(path => {
    const completedInPath = path.challenges.filter(id => completedChallenges[id]).length;
    const progress = (completedInPath / path.challenges.length) * 100;
    const isUnlocked = path.prerequisites.every(prereq => {
      const prereqPath = LEARNING_PATHS.find(p => p.id === prereq);
      if (!prereqPath) return true;
      return prereqPath.challenges.every(id => completedChallenges[id]);
    });

    return {
      ...path,
      progress,
      isUnlocked,
      completedChallenges: completedInPath,
      totalChallenges: path.challenges.length,
    };
  });
};

export const getNextChallenges = async (userId: string): Promise<Challenge[]> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const completedChallenges = userData?.progress?.completedChallenges || {};
  const inProgressChallenges = userData?.progress?.inProgressChallenges || {};

  // Get all challenges
  const challengesRef = collection(db, 'challenges');
  const challengesSnapshot = await getDocs(challengesRef);
  const allChallenges = challengesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Challenge[];

  // Filter out completed challenges
  const availableChallenges = allChallenges.filter(
    challenge => !completedChallenges[challenge.id]
  );

  // Sort challenges by:
  // 1. Prerequisites met
  // 2. Difficulty progression
  // 3. Popularity (completedBy count)
  // 4. If it's in progress
  const difficultyWeight = {
    beginner: 1,
    intermediate: 2,
    expert: 3,
  };

  const userLevel = calculateUserLevel(userData);

  return availableChallenges
    .filter(challenge => {
      // Check if prerequisites are met
      return challenge.prerequisites?.every(prereq => completedChallenges[prereq]) ?? true;
    })
    .sort((a, b) => {
      // Sort by appropriate difficulty level
      const aDiffWeight = difficultyWeight[a.difficulty as keyof typeof difficultyWeight] || 0;
      const bDiffWeight = difficultyWeight[b.difficulty as keyof typeof difficultyWeight] || 0;
      
      const aDistanceFromLevel = Math.abs(aDiffWeight - userLevel);
      const bDistanceFromLevel = Math.abs(bDiffWeight - userLevel);
      
      if (aDistanceFromLevel !== bDistanceFromLevel) {
        return aDistanceFromLevel - bDistanceFromLevel;
      }

      // Prioritize in-progress challenges
      if (inProgressChallenges[a.id] && !inProgressChallenges[b.id]) return -1;
      if (!inProgressChallenges[a.id] && inProgressChallenges[b.id]) return 1;

      // Then sort by popularity
      return (b.completedBy || 0) - (a.completedBy || 0);
    })
    .slice(0, 5); // Return top 5 recommendations
};

const calculateUserLevel = (userData: any): number => {
  const completedChallenges = userData?.progress?.completedChallenges || {};
  const totalPoints = userData?.progress?.totalPoints || 0;
  const challengeCount = Object.keys(completedChallenges).length;

  if (challengeCount === 0) return 1; // Beginner
  if (totalPoints > 1000 && challengeCount > 20) return 3; // Expert
  if (totalPoints > 500 && challengeCount > 10) return 2; // Intermediate
  return 1; // Beginner
};

export const getRelatedResources = async (challengeId: string) => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeDoc = await getDoc(challengeRef);
  const challenge = challengeDoc.data();

  if (!challenge) return [];

  // Get related challenges based on category and difficulty
  const relatedRef = collection(db, 'challenges');
  const relatedQuery = query(
    relatedRef,
    where('category', '==', challenge.category),
    where('difficulty', '==', challenge.difficulty),
    orderBy('completedBy', 'desc')
  );

  const relatedSnapshot = await getDocs(relatedQuery);
  return relatedSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(related => related.id !== challengeId)
    .slice(0, 3);
}; 