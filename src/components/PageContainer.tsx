import React from 'react';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { PageTitle } from './styled';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  maxWidth = 'lg',
  children,
}) => {
  return (
    <Box
      sx={{
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        minHeight: '100%',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth={maxWidth}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return item.path && !isLast ? (
                <Link
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <Typography
                  key={item.label}
                  color={isLast ? 'text.primary' : 'inherit'}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        )}

        <Box
          sx={{
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <PageTitle variant="h1">{title}</PageTitle>
            {subtitle && (
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>

        {children}
      </Container>
    </Box>
  );
};

export default PageContainer; 