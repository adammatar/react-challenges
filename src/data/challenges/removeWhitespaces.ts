export const removeWhitespacesChallenge = {
  id: 'removeWhitespaces',
  title: 'Remove Whitespaces',
  description: 'Create a function that removes all whitespace characters from a string.',
  difficulty: 'beginner',
  points: 10,
  estimatedTime: '15 mins',
  category: 'strings',
  requirements: [
    'Remove all whitespace characters (spaces, tabs, newlines)',
    'Handle empty strings',
    'Handle strings with only whitespace',
    'Preserve non-whitespace characters'
  ],
  example: {
    input: 'removeWhitespaces("  Hello  World  ")',
    output: '"HelloWorld"',
    explanation: 'The function removes all spaces from the input string, including leading and trailing spaces.'
  },
  starterCode: {
    javascript: `const removeWhitespaces = (string) => {
  // Enter your code here
};`,
    typescript: `const removeWhitespaces = (string: string): string => {
  // Enter your code here
};`
  },
  solution: {
    javascript: `const removeWhitespaces = (string) => {
  return string.replace(/\\s+/g, '');
};`,
    typescript: `const removeWhitespaces = (string: string): string => {
  return string.replace(/\\s+/g, '');
};`
  },
  testCases: [
    {
      name: 'Removes spaces',
      input: '"  Hello  World  "',
      expectedOutput: '"HelloWorld"'
    },
    {
      name: 'Handles empty string',
      input: '""',
      expectedOutput: '""'
    },
    {
      name: 'Handles only whitespace',
      input: '"    "',
      expectedOutput: '""'
    },
    {
      name: 'Preserves non-whitespace',
      input: '"HelloWorld"',
      expectedOutput: '"HelloWorld"'
    }
  ]
}; 