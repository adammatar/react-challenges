import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

interface UsernameDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  defaultUsername?: string;
}

export default function UsernameDialog({ open, onClose, onSubmit, defaultUsername = '' }: UsernameDialogProps) {
  const [username, setUsername] = useState(defaultUsername);
  const [error, setError] = useState('');

  const validateUsername = (value: string): boolean => {
    if (!value) {
      setError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateUsername(username)) {
      onSubmit(username);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Choose a Username</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) validateUsername(e.target.value);
            }}
            error={!!error}
            helperText={error || 'Username can only contain letters, numbers, and underscores'}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 