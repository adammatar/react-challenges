import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Stack,
  Box,
  Container,
} from '@mui/material';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'discussion' | 'comment' | 'notification' | 'profile';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  type = 'discussion',
}) => {
  const renderDiscussionSkeleton = () => (
    <Card sx={{ width: '100%', mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="rounded" width={80} height={32} />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderCommentSkeleton = () => (
    <Card sx={{ width: '100%', mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="text" width="100%" height={60} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderNotificationSkeleton = () => (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
    </Box>
  );

  const renderProfileSkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i}>
                    <Skeleton variant="text" width={60} height={32} />
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'profile':
        return renderProfileSkeleton();
      case 'comment':
        return renderCommentSkeleton();
      case 'notification':
        return renderNotificationSkeleton();
      default:
        return renderDiscussionSkeleton();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          {renderSkeleton()}
        </Box>
      ))}
    </>
  );
};

export default SkeletonLoader; 