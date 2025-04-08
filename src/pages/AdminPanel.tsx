import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Challenge } from '../contexts/ChallengesContext';
import { toast } from 'react-toastify';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface ChallengeFormData {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  points: number;
  code: string;
  starterCode: string;
  tests: TestCase[];
  solution: string;
  requirements: string[];
  example: {
    input: string;
    output: string;
  };
  hints: string[];
  solutionSteps: string[];
}

const initialFormData: ChallengeFormData = {
  title: '',
  description: '',
  difficulty: 'beginner',
  points: 100,
  code: '',
  starterCode: 'function solution(input) {\n  // Your code here\n}',
  tests: [{ input: '', expectedOutput: '' }],
  solution: 'function solution(input) {\n  // Solution code here\n}',
  requirements: [],
  example: {
    input: '',
    output: ''
  },
  hints: [],
  solutionSteps: []
};

const AdminPanel = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [open, setOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChallengeFormData>(initialFormData);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'challenges'));
      const challengesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Challenge[];
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    }
  };

  const handleOpen = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge.id);
      handleEditChallenge(challenge);
    } else {
      setEditingChallenge(null);
      setFormData(initialFormData);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingChallenge(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: keyof ChallengeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...formData.tests];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData(prev => ({ ...prev, tests: newTestCases }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, { input: '', expectedOutput: '' }],
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const challengeData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        points: formData.points,
        code: formData.code,
        starterCode: formData.starterCode,
        tests: formData.tests.map(test => ({
          input: test.input,
          expectedOutput: test.expectedOutput
        })),
        solution: formData.solution,
        requirements: formData.requirements,
        example: formData.example,
        hints: formData.hints,
        solutionSteps: formData.solutionSteps,
        updatedAt: new Date().toISOString()
      };

      if (editingChallenge) {
        await updateDoc(doc(db, 'challenges', editingChallenge), challengeData);
        toast.success('Challenge updated successfully');
      } else {
        await addDoc(collection(db, 'challenges'), {
          ...challengeData,
          createdAt: new Date().toISOString()
        });
        toast.success('Challenge created successfully');
      }
      handleClose();
      fetchChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('Failed to save challenge');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteDoc(doc(db, 'challenges', id));
        toast.success('Challenge deleted successfully');
        fetchChallenges();
      } catch (error) {
        console.error('Error deleting challenge:', error);
        toast.error('Failed to delete challenge');
      }
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      points: challenge.points,
      code: challenge.code,
      starterCode: challenge.starterCode,
      tests: challenge.tests.map(test => ({
        input: test.input,
        expectedOutput: test.expectedOutput
      })),
      solution: challenge.solution,
      requirements: challenge.requirements,
      example: challenge.example,
      hints: challenge.hints,
      solutionSteps: challenge.solutionSteps
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Manage Challenges</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add New Challenge
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Test Cases</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>{challenge.title}</TableCell>
                <TableCell>{challenge.difficulty}</TableCell>
                <TableCell>{challenge.points}</TableCell>
                <TableCell>{challenge.tests.length}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(challenge)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(challenge.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                fullWidth
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </TextField>
              <TextField
                label="Points"
                type="number"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                fullWidth
              />
            </Box>

            <Typography variant="h6">Starter Code</Typography>
            <Paper sx={{ height: 200 }}>
              <Editor
                height="200px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={formData.starterCode}
                onChange={(value) => handleInputChange('starterCode', value)}
              />
            </Paper>

            <Typography variant="h6">Solution</Typography>
            <Paper sx={{ height: 200 }}>
              <Editor
                height="200px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={formData.solution}
                onChange={(value) => handleInputChange('solution', value)}
              />
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Test Cases</Typography>
                <Button onClick={addTestCase}>Add Test Case</Button>
              </Box>
              {formData.tests.map((testCase, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">Test Case {index + 1}</Typography>
                    {formData.tests.length > 1 && (
                      <IconButton onClick={() => removeTestCase(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <TextField
                    label="Input"
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Expected Output"
                    value={testCase.expectedOutput}
                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                    fullWidth
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingChallenge ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 