import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Checkbox,
  TablePagination,
  Toolbar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DeleteSweep as DeleteSweepIcon,
  Archive as ArchiveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { GridProps } from '@mui/material';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  category: string;
  points: number;
  starterCode: {
    javascript: string;
    typescript: string;
  };
  solution: string;
  testCases: TestCase[];
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  example: {
    input: string;
    output: string;
  };
  requirements: string[];
  estimatedTime: string;
  completedBy: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const difficultyColors: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
  beginner: 'success',
  intermediate: 'warning',
  expert: 'error'
};

const categories = [
  'Components',
  'Hooks',
  'State Management',
  'Forms',
  'API Integration',
  'Routing',
  'Performance',
  'Testing',
  'Styling',
  'Authentication',
];

const difficulties = ['beginner', 'intermediate', 'expert'] as const;

const ChallengeManager = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Partial<Challenge> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [categories, setCategories] = useState([
    'Components',
    'Hooks',
    'State Management',
    'Forms',
    'API Integration',
    'Routing',
    'Performance',
    'Testing',
    'Styling',
    'Authentication',
    'Algorithms',
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as typeof difficulties[number],
    category: categories[0],
    points: 100,
    starterCode: {
      javascript: '',
      typescript: ''
    },
    solution: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    isPublished: false,
    example: {
      input: '',
      output: ''
    },
    requirements: [''],
    estimatedTime: '15 minutes',
    completedBy: 0
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    difficulty: '',
    category: '',
    points: '',
    initialCode: '',
    solution: '',
    testCases: '',
    example: ''
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const challengesData = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Challenge[];
      setChallenges(challengesData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredChallenges.map((challenge) => challenge.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selected.length} challenges?`)) {
      return;
    }

    try {
      const batch = writeBatch(db);
      selected.forEach((id) => {
        const ref = doc(db, 'challenges', id);
        batch.delete(ref);
      });
      await batch.commit();
      
      setChallenges(prev => prev.filter(challenge => !selected.includes(challenge.id)));
      setSelected([]);
      toast.success(`Successfully deleted ${selected.length} challenges`);
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      toast.error('Failed to delete challenges');
    }
  };

  const handleBulkTogglePublish = async (publish: boolean) => {
    try {
      const batch = writeBatch(db);
      selected.forEach((id) => {
        const ref = doc(db, 'challenges', id);
        batch.update(ref, { isPublished: publish });
      });
      await batch.commit();
      
      setChallenges(prev => prev.map(challenge => 
        selected.includes(challenge.id) 
          ? { ...challenge, isPublished: publish }
          : challenge
      ));
      setSelected([]);
      toast.success(`Successfully ${publish ? 'published' : 'unpublished'} ${selected.length} challenges`);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update challenges');
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || challenge.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (challenge?: Challenge) => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        points: challenge.points,
        starterCode: challenge.starterCode,
        solution: challenge.solution,
        testCases: challenge.testCases,
        isPublished: challenge.isPublished,
        example: challenge.example,
        requirements: challenge.requirements,
        estimatedTime: challenge.estimatedTime,
        completedBy: challenge.completedBy
      });
      setSelectedChallenge(challenge);
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'beginner',
        category: categories[0],
        points: 100,
        starterCode: {
          javascript: '',
          typescript: ''
        },
        solution: '',
        testCases: [{ input: '', expectedOutput: '', isHidden: false }],
        isPublished: false,
        example: {
          input: '',
          output: ''
        },
        requirements: [''],
        estimatedTime: '15 minutes',
        completedBy: 0
      });
      setSelectedChallenge(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChallenge(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExampleChange = (field: 'input' | 'output', value: string) => {
    setFormData(prev => ({
      ...prev,
      example: {
        ...prev.example,
        [field]: value
      }
    }));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const handleRemoveTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleAddRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? value : req
      )
    }));
  };

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      difficulty: '',
      category: '',
      points: '',
      initialCode: '',
      solution: '',
      testCases: '',
      example: ''
    };

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.difficulty) {
      errors.difficulty = 'Difficulty is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.points <= 0) {
      errors.points = 'Points must be greater than 0';
    }

    if (!formData.starterCode.javascript.trim()) {
      errors.initialCode = 'JavaScript starter code is required';
    }

    if (!formData.solution.trim()) {
      errors.solution = 'Solution is required';
    }

    if (formData.testCases.length === 0) {
      errors.testCases = 'At least one test case is required';
    } else {
      const hasEmptyTestCase = formData.testCases.some(
        testCase => !testCase.input.trim() || !testCase.expectedOutput.trim()
      );
      if (hasEmptyTestCase) {
        errors.testCases = 'All test cases must have input and expected output';
      }
    }

    if (!formData.example.input.trim() || !formData.example.output.trim()) {
      errors.example = 'Example input and output are required';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const challengeId = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^[0-9]+/, '');

      const formattedStarterCode = {
        javascript: `const ${challengeId} = (nums) => {
  // Your code here
};`,
        typescript: `const ${challengeId} = (nums: number[]): number => {
  // Your code here
};`
      };

      const formattedSolution = `const ${challengeId} = (nums) => {
  if (!nums || nums.length === 0) return 0;
  
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
};`;

      const challengeData = {
        ...formData,
        starterCode: formattedStarterCode,
        solution: formattedSolution,
        id: challengeId,
        createdAt: selectedChallenge?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      if (selectedChallenge?.id) {
        const existingChallenge = await getDoc(doc(db, 'challenges', selectedChallenge.id));
        if (!existingChallenge.exists()) {
          throw new Error('Challenge not found');
        }
        await updateDoc(doc(db, 'challenges', selectedChallenge.id), challengeData);
        toast.success('Challenge updated successfully');
      } else {
        const challengeRef = doc(db, 'challenges', challengeId);
        await setDoc(challengeRef, challengeData);
        toast.success('Challenge created successfully');
      }

      handleCloseDialog();
      fetchChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      setLoading(true);
      try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (!challengeDoc.exists()) {
          toast.error('Challenge not found');
          return;
        }

        await deleteDoc(challengeRef);
        
        // Update the local state immediately
        setChallenges(prevChallenges => 
          prevChallenges.filter(challenge => challenge.id !== challengeId)
        );
        
        // Clear selection if the deleted challenge was selected
        if (selected.includes(challengeId)) {
          setSelected(prev => prev.filter(id => id !== challengeId));
        }

        // Close any open dialogs
        handleCloseDialog();

        toast.success('Challenge deleted successfully');
      } catch (error) {
        console.error('Error deleting challenge:', error);
        toast.error('Failed to delete challenge');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string | null) => {
    if (newValue) {
      if (newValue.startsWith('Add "') && newValue.endsWith('"')) {
        const categoryToAdd = newValue.replace('Add "', '').replace('"', '');
        if (!categories.includes(categoryToAdd)) {
          setCategories(prev => [...prev, categoryToAdd]);
          setFormData(prev => ({ ...prev, category: categoryToAdd }));
        }
      } else {
        setFormData(prev => ({ ...prev, category: newValue }));
      }
    }
  };

  const handleCategoryInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setNewCategory(newInputValue);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Challenge Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Challenge
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="all">All Difficulties</MenuItem>
                {difficulties.map((diff) => (
                  <MenuItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              {selected.length} {selected.length === 1 ? 'challenge' : 'challenges'} selected
            </Typography>
            <Button
              startIcon={<DeleteSweepIcon />}
              color="error"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
            <Button
              startIcon={<VisibilityIcon />}
              color="primary"
              onClick={() => handleBulkTogglePublish(true)}
            >
              Publish Selected
            </Button>
            <Button
              startIcon={<VisibilityOffIcon />}
              color="warning"
              onClick={() => handleBulkTogglePublish(false)}
            >
              Unpublish Selected
            </Button>
          </Box>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredChallenges.length}
                      checked={filteredChallenges.length > 0 && selected.length === filteredChallenges.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChallenges
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((challenge) => {
                    const isSelected = selected.indexOf(challenge.id) !== -1;
                    return (
                      <TableRow
                        key={challenge.id}
                        selected={isSelected}
                        hover
                        onClick={() => handleClick(challenge.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} />
                        </TableCell>
                        <TableCell>{challenge.title}</TableCell>
                        <TableCell>{challenge.category}</TableCell>
                        <TableCell>
                          <Chip
                            label={challenge.difficulty}
                            color={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{challenge.points}</TableCell>
                        <TableCell>
                          <Chip
                            label={challenge.isPublished ? 'Published' : 'Draft'}
                            color={challenge.isPublished ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Preview">
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChallenge(challenge);
                              setPreviewOpen(true);
                            }}>
                              <PreviewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(challenge);
                            }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(challenge.id);
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredChallenges.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Challenge Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          {selectedChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={categories}
                  value={formData.category}
                  onChange={handleCategoryChange}
                  onInputChange={handleCategoryInputChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      error={!!formErrors.category}
                      helperText={formErrors.category}
                      required
                    />
                  )}
                  renderOption={(props, option) => {
                    if (option.startsWith('Add "')) {
                      return (
                        <li {...props} style={{ color: 'primary.main' }}>
                          <AddIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                          {option}
                        </li>
                      );
                    }
                    return <li {...props}>{option}</li>;
                  }}
                  filterOptions={(options, params) => {
                    const filtered = options.filter(option => 
                      option.toLowerCase().includes(params.inputValue.toLowerCase())
                    );
                    
                    if (params.inputValue !== '' && !options.includes(params.inputValue)) {
                      filtered.push(`Add "${params.inputValue}"`);
                    }
                    
                    return filtered;
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.difficulty}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as typeof difficulties[number] }))}
                    label="Difficulty"
                  >
                    {difficulties.map(diff => (
                      <MenuItem key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.difficulty && <Typography color="error" variant="caption">{formErrors.difficulty}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Points"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleInputChange}
                  error={!!formErrors.points}
                  helperText={formErrors.points}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  required
                />
              </Grid>

              {/* Requirements Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Requirements
                </Typography>
                {formData.requirements.map((requirement, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={11}>
                        <TextField
                          fullWidth
                          label={`Requirement ${index + 1}`}
                          value={requirement}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveRequirement(index)}
                          disabled={formData.requirements.length === 1}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddRequirement}
                  sx={{ mt: 1 }}
                >
                  Add Requirement
                </Button>
              </Grid>

              {/* Example Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Example
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Input"
                      value={formData.example.input}
                      onChange={(e) => handleExampleChange('input', e.target.value)}
                      error={!!formErrors.example}
                      helperText={formErrors.example}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Output"
                      value={formData.example.output}
                      onChange={(e) => handleExampleChange('output', e.target.value)}
                      error={!!formErrors.example}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Code Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Code
                </Typography>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{ 
                    mb: 2,
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Tab label="JavaScript" />
                  <Tab label="TypeScript" />
                </Tabs>
                <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>JavaScript Starter Code</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    name="starterCode.javascript"
                    value={formData.starterCode.javascript}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      starterCode: {
                        ...prev.starterCode,
                        javascript: e.target.value
                      }
                    }))}
                    placeholder="Enter JavaScript starter code"
                    required
                  />
                </Box>
                <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>TypeScript Starter Code</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    name="starterCode.typescript"
                    value={formData.starterCode.typescript}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      starterCode: {
                        ...prev.starterCode,
                        typescript: e.target.value
                      }
                    }))}
                    placeholder="Enter TypeScript starter code"
                    required
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Solution</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    error={!!formErrors.solution}
                    helperText={formErrors.solution}
                    placeholder="Enter the solution code"
                    required
                  />
                </Box>
              </Grid>

              {/* Test Cases Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Test Cases
                </Typography>
                {formData.testCases.map((testCase, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Input"
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          error={!!formErrors.testCases}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Expected Output"
                          value={testCase.expectedOutput}
                          onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                          error={!!formErrors.testCases}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={testCase.isHidden}
                                onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                              />
                            }
                            label="Hidden"
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveTestCase(index)}
                            disabled={formData.testCases.length === 1}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTestCase}
                  sx={{ mt: 1 }}
                >
                  Add Test Case
                </Button>
              </Grid>

              {/* Additional Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Additional Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estimated Time"
                      name="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={handleInputChange}
                      helperText="e.g., '15 minutes', '1 hour'"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isPublished}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        />
                      }
                      label="Publish immediately"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2
        }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Challenge'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Challenge Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Challenge Preview</DialogTitle>
        <DialogContent>
          {selectedChallenge && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h5" gutterBottom>{selectedChallenge.title}</Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Chip
                  label={selectedChallenge.difficulty}
                  color={difficultyColors[selectedChallenge.difficulty as keyof typeof difficultyColors]}
                  size="small"
                />
                <Chip label={selectedChallenge.category} size="small" />
                <Chip label={`${selectedChallenge.points} points`} size="small" />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedChallenge.description}
              </Typography>
              <Typography variant="h6" gutterBottom>Initial Code</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedChallenge.starterCode.javascript}
                </pre>
              </Paper>
              <Typography variant="h6" gutterBottom>Test Cases</Typography>
              {selectedChallenge.testCases && selectedChallenge.testCases.map((testCase, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Test Case {index + 1} {testCase.isHidden && '(Hidden)'}
                  </Typography>
                  <Typography>Input: {testCase.input}</Typography>
                  <Typography>Expected Output: {testCase.expectedOutput}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChallengeManager; 