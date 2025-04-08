import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { Challenge } from '../../types/challenge';
import * as ts from 'typescript';

interface TestEnvironmentProps {
  challenge: Challenge;
  userCode: string;
  language: 'javascript' | 'typescript';
}

export const TestEnvironment: React.FC<TestEnvironmentProps> = ({ challenge, userCode, language }) => {
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const runTests = async () => {
      setIsRunning(true);
      try {
        let codeToExecute = userCode;

        // If TypeScript, transpile to JavaScript
        if (language === 'typescript') {
          const result = ts.transpileModule(codeToExecute, {
            compilerOptions: {
              target: 2, // ES5
              module: 1, // CommonJS
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true
            }
          });
          codeToExecute = result.outputText;
        }

        // Create a sandboxed environment
        console.log('Code to execute:', codeToExecute);
        const sandbox = new Function(`
          console.log('Executing code in sandbox');
          ${codeToExecute}
          console.log('${challenge.id} defined:', typeof ${challenge.id});
          const fn = ${challenge.id};
          if (typeof fn !== 'function') {
            throw new Error('${challenge.id} is not a function');
          }
          return (input) => {
            const result = fn(input);
            if (result === undefined) {
              throw new Error('Function did not return a value. Make sure to use the return statement.');
            }
            return result;
          };
        `)();

        console.log('Sandbox created, running tests...');
        // Run test cases
        const results = challenge.testCases.map(test => {
          try {
            console.log('Running test:', test.name, 'with input:', test.input);
            // Parse the input string to get the actual value
            const input = JSON.parse(test.input);
            const result = sandbox(input);
            console.log('Test result:', result);
            // Parse the expected output string
            const expectedOutput = JSON.parse(test.expectedOutput);
            // Compare strings directly since our function handles all whitespace
            const passed = result === expectedOutput;
            return {
              name: test.name,
              passed,
              error: passed ? undefined : `Expected ${JSON.stringify(expectedOutput)}, but got ${JSON.stringify(result)}`
            };
          } catch (error) {
            console.error('Test error:', error);
            return {
              name: test.name,
              passed: false,
              error: error instanceof Error ? error.message : String(error)
            };
          }
        });

        setTestResults(results);
      } catch (error) {
        console.error('Test execution error:', error);
        setTestResults([{
          name: 'Compilation Error',
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        }]);
      }
      setIsRunning(false);
    };

    runTests();
  }, [userCode, challenge.testCases, language]);

  return (
    <Paper sx={{ p: 2, height: '500px', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Test Results
      </Typography>
      
      {isRunning ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {testResults.map((result, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: result.passed ? 'success.main' : 'error.main',
                    mr: 1
                  }}
                />
                <Typography variant="body1">
                  Test Case {index + 1}: {result.name || `Input: ${challenge.testCases[index].input}`}
                </Typography>
              </Box>
              {!result.passed && result.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {result.error}
                </Alert>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}; 