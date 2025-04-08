import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  EmojiEvents as AchievementIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { verifyCertificate } from '../services/certificateService';
import { CertificateMetadata } from '../types/certificate';

export default function CertificateVerification() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateMetadata | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        if (!certificateId) {
          setError('Certificate ID is required');
          return;
        }

        const result = await verifyCertificate(certificateId);
        if (!result) {
          setError('Certificate not found');
          return;
        }

        setCertificate(result);
      } catch (error) {
        setError('Failed to verify certificate');
        console.error('Error verifying certificate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !certificate) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Certificate verification failed'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <VerifiedIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1">
            Certificate Verified
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 4 }}>
          This is an authentic certificate issued by React Challenges
        </Alert>

        <Divider sx={{ my: 3 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <PersonIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Issued To"
              secondary={certificate.issuedTo}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <DateIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Issue Date"
              secondary={certificate.issuedOn}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AchievementIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Achievement"
              secondary={certificate.achievement}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <LinkIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Certificate ID"
              secondary={certificate.certificateId}
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
} 