import React from 'react';
import { Box, Paper } from '@mui/material';
import { SectionTitle } from './styled';

interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  noPaper?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  action,
  noPadding = false,
  noPaper = false,
  children,
}) => {
  const content = (
    <>
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            px: noPaper ? 0 : 3,
            pt: noPaper ? 0 : 2,
          }}
        >
          {title && <SectionTitle>{title}</SectionTitle>}
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <Box
        sx={{
          px: noPadding ? 0 : (noPaper ? 0 : 3),
          pb: noPadding ? 0 : (noPaper ? 0 : 3),
        }}
      >
        {children}
      </Box>
    </>
  );

  if (noPaper) {
    return content;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {content}
    </Paper>
  );
};

export default Section; 