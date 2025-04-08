export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  points: number;
  estimatedTime: string;
  category: string;
  requirements: string[];
  example: {
    input: string;
    output: string;
    explanation?: string;
  };
  starterCode: {
    javascript: string;
    typescript: string;
  };
  solution: {
    javascript: string;
    typescript: string;
  };
  testCases: {
    name: string;
    input: string;
    expectedOutput: string;
  }[];
}

export interface TestCase {
  description: string;
  test: string;
  input: any;
  expectedOutput: any;
} 