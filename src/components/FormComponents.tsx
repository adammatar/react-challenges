import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Stack,
  styled,
} from '@mui/material';

// Styled components
export const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

// Form field components
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

interface TextInputProps extends FormFieldProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  required = false,
  fullWidth = true,
  disabled = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 1,
}) => (
  <FormControl fullWidth={fullWidth} error={!!error}>
    <FormLabel required={required}>{label}</FormLabel>
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      error={!!error}
      helperText={error}
      disabled={disabled}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      fullWidth
      variant="outlined"
      size="small"
      sx={{
        mt: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
        },
      }}
    />
  </FormControl>
);

interface SelectInputProps extends FormFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  error,
  required = false,
  fullWidth = true,
  disabled = false,
  value,
  onChange,
  options,
}) => (
  <FormControl fullWidth={fullWidth} error={!!error}>
    <FormLabel required={required}>{label}</FormLabel>
    <TextField
      select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      disabled={disabled}
      fullWidth
      variant="outlined"
      size="small"
      sx={{
        mt: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
        },
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  </FormControl>
);

interface CheckboxInputProps extends FormFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  error,
  required = false,
  disabled = false,
  checked,
  onChange,
}) => (
  <FormControl error={!!error}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <FormLabel required={required}>{label}</FormLabel>
    </Stack>
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

// Form buttons
interface FormButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const FormButton: React.FC<FormButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'contained',
  color = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => (
  <Button
    onClick={onClick}
    type={type}
    variant={variant}
    color={color}
    disabled={disabled || loading}
    fullWidth={fullWidth}
    sx={{
      borderRadius: 1,
      textTransform: 'none',
      px: 3,
      py: 1,
    }}
  >
    {loading ? 'Loading...' : children}
  </Button>
);

// Form layout components
interface FormRowProps {
  children: React.ReactNode;
  spacing?: number;
}

export const FormRow: React.FC<FormRowProps> = ({ children, spacing = 2 }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={spacing}
    sx={{ mb: spacing }}
  >
    {children}
  </Stack>
); 