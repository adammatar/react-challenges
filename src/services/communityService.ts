import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string | null;
  totalPoints: number;
  rank: string;
  achievements: string[];
  followers: string[];
  following: string[];
}

interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  createdAt: string;
  likes: number;
  isHelpful: boolean;
}

interface Discussion {
  id: string;
  challengeId: string;
  title: string;
  content: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
  tags: string[];
  solved: boolean;
}

interface Activity {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  type: 'challenge_completed' | 'achievement_unlocked' | 'comment_added' | 'helpful_answer';
  challengeId?: string;
  challengeTitle?: string;
  achievementId?: string;
  achievementTitle?: string;
  discussionId?: string;
  createdAt: string;
}

// Leaderboard
export const getLeaderboard = async (timeframe: 'weekly' | 'monthly' | 'allTime' = 'allTime', limitCount = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('progress.totalPoints', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      id: doc.id,
      rank: index + 1,
      displayName: data.displayName,
      photoURL: data.photoURL,
      totalPoints: data.progress?.totalPoints || 0,
      achievements: Object.keys(data.achievements || {}).length,
    };
  });
};

// Discussions
export const getDiscussions = async (challengeId: string) => {
  const discussionsRef = collection(db, 'discussions');
  const q = query(
    discussionsRef,
    where('challengeId', '==', challengeId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Discussion[];
};

export const createDiscussion = async (
  challengeId: string,
  userId: string,
  title: string,
  content: string,
  tags: string[] = []
) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  const discussion = {
    challengeId,
    title,
    content,
    userId,
    userDisplayName: userData?.displayName || 'Anonymous',
    userPhotoURL: userData?.photoURL || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    comments: [],
    tags,
    solved: false,
  };

  const discussionRef = await addDoc(collection(db, 'discussions'), discussion);
  return {
    id: discussionRef.id,
    ...discussion,
  };
};

export const addComment = async (
  discussionId: string,
  userId: string,
  content: string
) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  const comment = {
    userId,
    userDisplayName: userData?.displayName || 'Anonymous',
    userPhotoURL: userData?.photoURL || null,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    isHelpful: false,
  };

  const discussionRef = doc(db, 'discussions', discussionId);
  await updateDoc(discussionRef, {
    comments: arrayUnion(comment),
    updatedAt: serverTimestamp(),
  });

  return comment;
};

export const markCommentAsHelpful = async (
  discussionId: string,
  commentId: string,
  authorId: string
) => {
  const discussionRef = doc(db, 'discussions', discussionId);
  const discussionDoc = await getDoc(discussionRef);
  const discussion = discussionDoc.data() as Discussion;

  // Update the comment
  const updatedComments = discussion.comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, isHelpful: true };
    }
    return comment;
  });

  // Update the discussion
  await updateDoc(discussionRef, {
    comments: updatedComments,
    solved: true,
    updatedAt: serverTimestamp(),
  });

  // Award points to the helpful user
  const userRef = doc(db, 'users', authorId);
  await updateDoc(userRef, {
    'progress.totalPoints': increment(10),
    helpfulResponses: increment(1),
  });

  // Check for community achievements
  const userDoc = await getDoc(userRef);
  const helpfulResponses = (userDoc.data()?.helpfulResponses || 0) + 1;
  
  if (helpfulResponses === 1) {
    await updateDoc(userRef, {
      achievements: arrayUnion('helpful-hand'),
    });
  } else if (helpfulResponses === 10) {
    await updateDoc(userRef, {
      achievements: arrayUnion('community-leader'),
    });
  }
};

// Following System
export const followUser = async (userId: string, targetUserId: string) => {
  const userRef = doc(db, 'users', userId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(userRef, {
    following: arrayUnion(targetUserId),
  });

  await updateDoc(targetUserRef, {
    followers: arrayUnion(userId),
  });
};

export const unfollowUser = async (userId: string, targetUserId: string) => {
  const userRef = doc(db, 'users', userId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(userRef, {
    following: arrayUnion(targetUserId),
  });

  await updateDoc(targetUserRef, {
    followers: arrayUnion(userId),
  });
};

// Activity Feed
export const getActivityFeed = async (userId: string): Promise<Activity[]> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const following = userDoc.data()?.following || [];

  // Get activities from followed users
  const activitiesRef = collection(db, 'activities');
  const q = query(
    activitiesRef,
    where('userId', 'in', [...following, userId]),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      userDisplayName: data.userDisplayName,
      userPhotoURL: data.userPhotoURL,
      type: data.type,
      challengeId: data.challengeId,
      challengeTitle: data.challengeTitle,
      achievementId: data.achievementId,
      achievementTitle: data.achievementTitle,
      discussionId: data.discussionId,
      createdAt: data.createdAt.toDate().toISOString(),
    } as Activity;
  });
};

// User Profile
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  return {
    id: userId,
    displayName: userData?.displayName || 'Anonymous',
    photoURL: userData?.photoURL || null,
    totalPoints: userData?.progress?.totalPoints || 0,
    rank: calculateRank(userData?.progress?.totalPoints || 0),
    achievements: Object.keys(userData?.achievements || {}),
    followers: userData?.followers || [],
    following: userData?.following || [],
  };
};

export const calculateRank = (points: number): string => {
  if (points >= 5000) return 'Grand Master';
  if (points >= 3000) return 'Master';
  if (points >= 2000) return 'Expert';
  if (points >= 1000) return 'Advanced';
  if (points >= 500) return 'Intermediate';
  if (points >= 100) return 'Beginner';
  return 'Novice';
};

// User Search
export const searchUsers = async (searchQuery: string) => {
  const usersRef = collection(db, 'users');
  const queryRef = query(
    usersRef,
    where('displayName', '>=', searchQuery),
    where('displayName', '<=', searchQuery + '\uf8ff'),
    limit(5)
  );

  const snapshot = await getDocs(queryRef);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      displayName: data.displayName as string,
      photoURL: data.photoURL as string | null,
    };
  });
}; 