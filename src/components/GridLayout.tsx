import React from 'react';
import { Box } from '@mui/material';

interface GridLayoutProps {
  children: React.ReactNode;
  spacing?: number;
  minChildWidth?: number;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  spacing = 3,
  minChildWidth = 300,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: spacing,
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`,
        },
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default GridLayout; 