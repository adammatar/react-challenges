export interface UserProgress {
  completedChallenges: {
    [challengeId: string]: {
      completedAt: number;
      code: string;
    };
  };
  totalPoints: number;
  inProgressChallenges: {
    [challengeId: string]: {
      lastModified: number;
      code: string;
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  progress: UserProgress;
  createdAt: number;
  updatedAt: number;
} 