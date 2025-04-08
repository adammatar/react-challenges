import React from 'react';
import { Box, Container, Paper } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withPaper?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  maxWidth = 'lg',
  withPaper = true 
}) => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth={maxWidth}>
        {withPaper ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {children}
          </Paper>
        ) : (
          children
        )}
      </Container>
    </Box>
  );
};

export default Layout; 