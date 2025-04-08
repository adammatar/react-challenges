import { Challenge } from '../../types/challenge';

export const isPalindromeChallenge: Challenge = {
  id: 'isPalindrome',
  title: 'Is Palindrome',
  description: 'Write a function that checks if a string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward.',
  difficulty: 'beginner',
  category: 'string',
  points: 10,
  estimatedTime: '5 minutes',
  requirements: [
    'The function should return true if the string is a palindrome',
    'The function should return false if the string is not a palindrome',
    'The function should ignore case (uppercase/lowercase)',
    'The function should ignore spaces and punctuation',
    'The function should handle empty strings'
  ],
  example: {
    input: '"A man, a plan, a canal: Panama"',
    output: 'true',
    explanation: 'The string is a palindrome when ignoring case, spaces, and punctuation'
  },
  starterCode: {
    javascript: `const isPalindrome = (str) => {
  // Enter your code here
};`,
    typescript: `const isPalindrome = (str: string): boolean => {
  // Enter your code here
};`
  },
  solution: {
    javascript: `const isPalindrome = (str) => {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
};`,
    typescript: `const isPalindrome = (str: string): boolean => {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
};`
  },
  testCases: [
    {
      name: 'Simple palindrome',
      input: '"racecar"',
      expectedOutput: 'true'
    },
    {
      name: 'Not a palindrome',
      input: '"hello"',
      expectedOutput: 'false'
    },
    {
      name: 'Palindrome with spaces and punctuation',
      input: '"A man, a plan, a canal: Panama"',
      expectedOutput: 'true'
    },
    {
      name: 'Empty string',
      input: '""',
      expectedOutput: 'true'
    },
    {
      name: 'Single character',
      input: '"a"',
      expectedOutput: 'true'
    },
    {
      name: 'Palindrome with numbers',
      input: '"12321"',
      expectedOutput: 'true'
    }
  ]
}; 