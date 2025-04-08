export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  challengeLevel: 'beginner' | 'intermediate' | 'expert';
  issueDate: Date;
  completedChallenges: number;
  totalChallenges: number;
  verificationCode: string;
}

export interface CertificateTemplate {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  logo?: string;
}

export interface CertificateMetadata {
  certificateId: string;
  issuedTo: string;
  issuedOn: string;
  achievement: string;
  verificationUrl: string;
} 