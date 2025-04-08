import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, Tabs, Tab, IconButton, Drawer, Stack, Alert, Modal } from '@mui/material';
import Editor from '@monaco-editor/react';
import { TestEnvironment } from './TestEnvironment';
import { Challenge } from '../../types/challenge';
import { Code as CodeIcon, Timer as TimerIcon, Star as StarIcon, PlayArrow as RunIcon, Send as SubmitIcon, Visibility as ShowSolutionIcon, VisibilityOff as HideSolutionIcon, Celebration as CelebrationIcon, Check as PassIcon, Close as FailIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { wrap } from 'comlink';
import * as ts from 'typescript';

interface ChallengeSolverProps {
  challenge: Challenge;
}

export const ChallengeSolver: React.FC<ChallengeSolverProps> = ({ challenge }) => {
  const { width, height } = useWindowSize();
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript');
  const [code, setCode] = useState(() => {
    const starterCode = challenge.starterCode[language];
    const requirementsComments = challenge.requirements.map(req => `// - ${req}`).join('\n');
    return `// ${challenge.title}\n// ${challenge.description}\n\n${requirementsComments}\n\n${starterCode}`;
  });
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { currentUser } = useAuth();

  // Create TypeScript worker
  useEffect(() => {
    const worker = new Worker(new URL('../../workers/tsWorker.ts', import.meta.url), {
      type: 'module'
    });
    return () => worker.terminate();
  }, []);

  // Check if challenge is completed when component mounts
  useEffect(() => {
    const checkCompletion = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const completedChallenges = userDoc.data().completedChallenges || {};
          setIsCompleted(completedChallenges[challenge.id] !== undefined);
        }
      }
    };
    checkCompletion();
  }, [challenge.id, currentUser]);

  const handleShowSolution = () => {
    console.log('Toggling solution visibility:', !showSolution);
    console.log('Current challenge solution:', challenge.solution);
    setShowSolution(!showSolution);
  };

  const handleLanguageChange = (event: React.SyntheticEvent, newValue: 'javascript' | 'typescript') => {
    setLanguage(newValue);
    const starterCode = challenge.starterCode[newValue];
    const requirementsComments = challenge.requirements.map(req => `// - ${req}`).join('\n');
    setCode(`// ${challenge.title}\n// ${challenge.description}\n\n${requirementsComments}\n\n${starterCode}`);
  };

  const handleRunTests = async () => {
    console.log('Run Tests button clicked');
    setIsRunning(true);
    console.log('isRunning set to true');
    console.log('Starting test execution, language:', language);
    
    try {
      let codeToExecute = code;
      
      // If TypeScript, transpile to JavaScript
      if (language === 'typescript') {
        console.log('Transpiling TypeScript to JavaScript...');
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
        console.log('Transpiled code:', codeToExecute);
      }

      // Create a sandboxed environment
      console.log('Creating sandboxed environment...');
      const sandbox = new Function(`
        ${codeToExecute}
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

      // Run test cases
      console.log('Running test cases...');
      console.log('Challenge test cases:', challenge.testCases);
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
          console.log('Test passed:', passed, 'Expected:', expectedOutput, 'Got:', result);
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

      console.log('Setting test results:', results);
      setTestResults(results);
      
      // Show toast notification based on test results
      const allPassed = results.every(result => result.passed);
      if (allPassed) {
        toast.success('All tests passed! 🎉');
      } else {
        toast.error('Some tests failed. Check the results and try again.');
      }
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResults([{
        name: 'Compilation Error',
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      }]);
      toast.error('Failed to run tests');
    }
    
    console.log('Setting isRunning to false');
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to submit a solution');
      return;
    }

    const allPassed = testResults.every(result => result.passed);
    if (!allPassed) {
      toast.error('Please make sure all tests pass before submitting');
      return;
    }

    try {
      // Update user's completed challenges
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`completedChallenges.${challenge.id}`]: {
          completedAt: new Date().toISOString(),
          code: code
        },
        points: increment(challenge.points)
      });

      // Update challenge completion count
      const challengeRef = doc(db, 'challenges', challenge.id);
      await updateDoc(challengeRef, {
        completedBy: increment(1)
      });

      setIsCompleted(true);
      setShowCelebration(true);
      toast.success('Challenge completed and saved! 🎉');
      
      // Hide celebration after 5 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.error('Failed to submit solution');
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  return (
    <Box sx={{ 
      p: 3,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      height: '100%',
      bgcolor: 'background.default'
    }}>
      {showCelebration && (
        <>
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
          <Modal
            open={showCelebration}
            onClose={() => setShowCelebration(false)}
            aria-labelledby="celebration-modal"
            aria-describedby="celebration-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <CelebrationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Challenge Completed!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Congratulations! You've earned {challenge.points} points.
              </Typography>
            </Box>
          </Modal>
        </>
      )}

      {/* Solution Display */}
      {showSolution && (
        <Paper sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          mb: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6">Solution</Typography>
            <IconButton onClick={handleShowSolution} size="small">
              <HideSolutionIcon />
            </IconButton>
          </Box>
          
          <Paper sx={{ 
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            overflow: 'auto',
            '& pre': {
              margin: 0,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              color: 'text.primary'
            }
          }}>
            <pre>{challenge.solution}</pre>
          </Paper>

          <Alert 
            severity="info" 
            sx={{ 
              mt: 3,
              bgcolor: 'info.dark',
              color: 'common.white',
              '& .MuiAlert-icon': {
                color: 'common.white'
              }
            }}
          >
            Try to solve the challenge on your own first. Use the solution only as a reference if you get stuck.
          </Alert>
        </Paper>
      )}

      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            {challenge.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={challenge.difficulty}
              color={challenge.difficulty === 'beginner' ? 'success' : challenge.difficulty === 'intermediate' ? 'warning' : 'error'}
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon fontSize="small" color="primary" />
              <Typography variant="body2">{challenge.points} points</Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={showSolution ? <HideSolutionIcon /> : <ShowSolutionIcon />}
          onClick={handleShowSolution}
          sx={{ minWidth: 150 }}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </Button>
      </Box>

      {/* Language Tabs */}
      <Tabs
        value={language}
        onChange={handleLanguageChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 2
        }}
      >
        <Tab label="JavaScript" value="javascript" />
        <Tab label="TypeScript" value="typescript" />
      </Tabs>

      {/* Editor and Test Environment */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { md: '1fr 1fr' }, 
        gap: 3,
        flex: 1,
        minHeight: 0
      }}>
        {/* Code Editor */}
        <Paper sx={{ 
          p: 2,
          height: '100%',
          minHeight: 500,
          bgcolor: 'background.paper',
          '& .monaco-editor': {
            borderRadius: 1
          }
        }}>
          <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={(value) => handleCodeChange(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
          />
        </Paper>

        {/* Test Environment */}
        <TestEnvironment
          challenge={challenge}
          userCode={code}
          language={language}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        justifyContent: 'flex-end',
        mt: 2
      }}>
        <Button
          variant="contained"
          startIcon={<RunIcon />}
          onClick={handleRunTests}
          disabled={isRunning}
          sx={{ minWidth: 120 }}
        >
          Run Tests
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SubmitIcon />}
          onClick={handleSubmit}
          disabled={!testResults.every(result => result.passed) || isCompleted}
          sx={{ minWidth: 120 }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}; 