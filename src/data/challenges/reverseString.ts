import { Challenge } from '../../types/challenge';

export const reverseStringChallenge: Challenge = {
  id: 'reverseString',
  title: 'Reverse String',
  description: 'Write a function that takes a string and returns it reversed.',
  difficulty: 'beginner',
  category: 'string',
  points: 10,
  estimatedTime: '5 minutes',
  requirements: [
    'The function should return the input string in reverse order',
    'The function should handle empty strings',
    'The function should preserve whitespace',
    'The function should handle special characters'
  ],
  example: {
    input: '"Hello, World!"',
    output: '"!dlroW ,olleH"',
    explanation: 'The function reverses each character in the string, including spaces and special characters.'
  },
  starterCode: {
    javascript: `const reverseString = (str) => {
  // Enter your code here
};`,
    typescript: `const reverseString = (str: string): string => {
  // Enter your code here
};`
  },
  solution: {
    javascript: `const reverseString = (str) => {
  return str.split('').reverse().join('');
};`,
    typescript: `const reverseString = (str: string): string => {
  return str.split('').reverse().join('');
};`
  },
  testCases: [
    {
      name: 'Reverses normal string',
      input: '"Hello"',
      expectedOutput: '"olleH"'
    },
    {
      name: 'Handles empty string',
      input: '""',
      expectedOutput: '""'
    },
    {
      name: 'Preserves whitespace',
      input: '"Hello World"',
      expectedOutput: '"dlroW olleH"'
    },
    {
      name: 'Handles special characters',
      input: '"Hello, World!"',
      expectedOutput: '"!dlroW ,olleH"'
    },
    {
      name: 'Handles numbers',
      input: '"12345"',
      expectedOutput: '"54321"'
    },
    {
      name: 'Handles mixed characters',
      input: '"a1b2c3"',
      expectedOutput: '"3c2b1a"'
    }
  ]
}; 