import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

export const UseLocalStorageDemo: React.FC = () => {
  // Test different data types
  const [stringValue, setStringValue] = useLocalStorage('string-key', 'initial string');
  const [numberValue, setNumberValue] = useLocalStorage('number-key', 42);
  const [objectValue, setObjectValue] = useLocalStorage('object-key', { name: 'test', count: 0 });
  const [arrayValue, setArrayValue] = useLocalStorage('array-key', [1, 2, 3]);
  
  // Test expiration
  const [expiringValue, setExpiringValue, clearExpiringValue] = useLocalStorage(
    'expiring-key',
    'This will expire in 5 seconds',
    { expiration: 5000 } // 5 seconds
  );

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        useLocalStorage Hook Demo
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>String Value</Typography>
        <TextField
          value={stringValue}
          onChange={(e) => setStringValue(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Number Value</Typography>
        <TextField
          type="number"
          value={numberValue}
          onChange={(e) => setNumberValue(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Object Value</Typography>
        <Typography variant="body1">
          {JSON.stringify(objectValue)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setObjectValue({ ...objectValue, count: objectValue.count + 1 })}
          sx={{ mt: 1 }}
        >
          Increment Count
        </Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Array Value</Typography>
        <Typography variant="body1">
          {JSON.stringify(arrayValue)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setArrayValue([...arrayValue, arrayValue.length + 1])}
          sx={{ mt: 1 }}
        >
          Add Item
        </Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Expiring Value</Typography>
        <Typography variant="body1">
          {expiringValue}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setExpiringValue('New value that will expire in 5 seconds')}
          sx={{ mt: 1, mr: 1 }}
        >
          Set New Value
        </Button>
        <Button
          variant="outlined"
          onClick={clearExpiringValue}
          sx={{ mt: 1 }}
        >
          Clear Value
        </Button>
      </Paper>
    </Box>
  );
}; 