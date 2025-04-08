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
    <Box sx={{ p: 2, position: 'relative' }}>
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
              <Typography variant="h4" component="h2" gutterBottom>
                Congratulations! 🎉
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                You've successfully completed the challenge and earned {challenge.points} points!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowCelebration(false)}
                startIcon={<CelebrationIcon />}
              >
                Continue
              </Button>
            </Box>
          </Modal>
        </>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {challenge.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Chip
            label={challenge.difficulty}
            color={challenge.difficulty === 'beginner' ? 'success' : challenge.difficulty === 'intermediate' ? 'warning' : 'error'}
            size="small"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon fontSize="small" color="primary" />
            <Typography variant="body2">{challenge.points} points</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon fontSize="small" />
            <Typography variant="body2">{challenge.estimatedTime}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Description and Requirements */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography paragraph>
          {challenge.description}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Example
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Input:</Typography>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {challenge.example.input}
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Output:</Typography>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {challenge.example.output}
          </Typography>
          {challenge.example.explanation && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Explanation:</Typography>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {challenge.example.explanation}
              </Typography>
            </>
          )}
        </Paper>

        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {challenge.requirements.map((req, index) => (
            <Typography component="li" key={index} sx={{ mb: 1 }}>
              {req}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* Code Editor and Tests */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ height: '500px', overflow: 'hidden' }}>
            <Tabs value={language} onChange={handleLanguageChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="JavaScript" value="javascript" />
              <Tab label="TypeScript" value="typescript" />
            </Tabs>
            <Editor
              height="400px"
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                tabCompletion: 'on',
                wordBasedSuggestions: true,
                parameterHints: { enabled: true },
                quickSuggestions: true,
                suggest: {
                  showWords: true,
                  showKeywords: true,
                  showSnippets: true,
                  showClasses: true,
                  showFunctions: true,
                  showVariables: true,
                  showReferences: true,
                  showValues: true,
                  showConstants: true,
                  showEnums: true,
                  showInterfaces: true,
                  showTypeParameters: true,
                  showModules: true,
                  showProperties: true,
                  showMethods: true,
                  showEvents: true,
                  showOperators: true,
                  showUnits: true,
                  showColors: true,
                  showFiles: true,
                  showFolders: true
                }
              }}
            />
          </Paper>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleShowSolution}
              startIcon={showSolution ? <HideSolutionIcon /> : <ShowSolutionIcon />}
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunTests}
                disabled={isRunning}
                startIcon={<RunIcon />}
              >
                {isRunning ? 'Running...' : 'Run Tests'}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!testResults.length || !testResults.every(result => result.passed) || isCompleted}
                startIcon={<SubmitIcon />}
              >
                {isCompleted ? 'Completed' : 'Submit'}
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <TestEnvironment challenge={challenge} userCode={code} language={language} />
        </Box>
      </Box>

      {/* Solution Drawer */}
      <Drawer
        anchor="right"
        open={showSolution}
        onClose={handleShowSolution}
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            p: 2
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Solution</Typography>
          <IconButton onClick={handleShowSolution}>
            <HideSolutionIcon />
          </IconButton>
        </Box>
        <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Solution:</Typography>
          <Box
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            {challenge.solution}
          </Box>
        </Paper>
        <Alert severity="info" sx={{ mt: 2 }}>
          Try to solve the challenge on your own first. Use the solution only as a reference if you get stuck.
        </Alert>
      </Drawer>

      {/* Solution Display */}
      {showSolution && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Solution
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" gutterBottom>
              JavaScript Solution:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}
            >
              {challenge.solution.javascript}
            </Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              TypeScript Solution:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}
            >
              {challenge.solution.typescript}
            </Box>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Try to solve the challenge on your own first. Use the solution only as a reference if you get stuck.
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Test Results */}
      <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Test Results:</Typography>
        <Stack spacing={1}>
          {testResults.map((result, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              {result.passed ? (
                <PassIcon color="success" sx={{ mr: 1 }} />
              ) : (
                <FailIcon color="error" sx={{ mr: 1 }} />
              )}
              <Typography variant="body2">
                Test Case {index + 1}: {result.name || `Input: ${challenge.testCases[index].input}`}
                {!result.passed && result.error && (
                  <Typography variant="caption" color="error" display="block">
                    {result.error}
                  </Typography>
                )}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}; 