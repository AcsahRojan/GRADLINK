import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  WorkspacePremium,
  Business,
  Timeline,
  Person,
  Launch,
  CalendarToday,
  School,
  Verified
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SNavbar from './SNavbar';
import { getMentorshipRequests } from '../api';

const MyMentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = '#e4e4e7';

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentorshipRequests();
        setMentors(data.filter(r => r.status === 'accepted'));
      } catch (error) {
        console.error("Failed to fetch mentors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  if (loading) return <Typography sx={{ p: 5, mt: 10 }}>Loading mentors...</Typography>;

  const MentorCard = ({ mentor }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: `1px solid ${glassBorder}`,
        transition: '0.3s',
        '&:hover': {
          borderColor: primaryBrand,
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" mb={3}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: primaryBrand,
              fontSize: '1.2rem',
              fontWeight: 700,
              boxShadow: `0 0 0 4px ${primaryBrand}15`
            }}
          >
            {mentor.alumni_full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6" fontWeight="800" color={deepZinc}>
                {mentor.alumni_full_name}
              </Typography>
              <Verified sx={{ fontSize: 18, color: primaryBrand }} />
            </Stack>
            <Typography variant="body2" fontWeight="600" color={mutedZinc}>
              {mentor.alumni_role}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
              <Business sx={{ fontSize: 16, color: mutedZinc }} />
              <Typography variant="caption" fontWeight="700" color={deepZinc}>
                {mentor.alumni_company}
              </Typography>
            </Stack>
          </Box>
          <Tooltip title="Mentor Profile">
            <IconButton
              size="small"
              onClick={() => navigate(`/alumniprofile/${mentor.alumni}`)}
              sx={{ border: `1px solid ${glassBorder}`, borderRadius: '10px' }}
            >
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <WorkspacePremium sx={{ fontSize: 16, color: mutedZinc }} />
              <Typography variant="caption" fontWeight="800" color={mutedZinc} sx={{ letterSpacing: '0.5px' }}>
                AGREED MENTORSHIP
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {mentor.mentorship_types_details?.map((type) => (
                <Chip
                  key={type.id}
                  label={type.name}
                  size="small"
                  sx={{
                    bgcolor: '#f4f4f5',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    borderRadius: '6px'
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarToday sx={{ fontSize: 14, color: mutedZinc }} />
            <Typography variant="caption" fontWeight="600" color={mutedZinc}>
              Since {new Date(mentor.requested_at).toLocaleDateString()}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Timeline />}
            onClick={() => navigate(`/mentorshipactivities/${mentor.id}`)}
            sx={{
              bgcolor: deepZinc,
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              mx: 2,
              px: 2,
              '&:hover': { bgcolor: '#18181b' }
            }}
          >
            Activities
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SNavbar />
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography variant="h4" fontWeight="900" sx={{ color: deepZinc, letterSpacing: '-1.5px' }}>
                  My Mentors
                </Typography>
                <Typography variant="body1" color={mutedZinc} sx={{ mt: 1 }}>
                  Manage your active professional relationships and track your growth journey.
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ color: `${primaryBrand}20`, lineHeight: 1 }}>
                {mentors.length}
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {mentors.map((mentor) => (
              <Grid item xs={12} md={6} lg={4} key={mentor.id}>
                <MentorCard mentor={mentor} />
              </Grid>
            ))}

            {/* Empty State / Add More CTA */}
            <Grid item xs={12} md={6} lg={4}>
              <Box
                onClick={() => navigate('/findalumni')}
                sx={{
                  height: '100%',
                  minHeight: 300,
                  borderRadius: '20px',
                  border: `2px dashed ${glassBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.2s',
                  p: 3,
                  '&:hover': {
                    borderColor: primaryBrand,
                    bgcolor: `${primaryBrand}05`
                  }
                }}
              >
                <Avatar sx={{ bgcolor: `${primaryBrand}15`, color: primaryBrand, mb: 2 }}>
                  <Launch />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="800" color={deepZinc}>
                  Find More Mentors
                </Typography>
                <Typography variant="caption" color={mutedZinc} textAlign="center" sx={{ mt: 1 }}>
                  Explore alumni working in your dream companies and request mentorship.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default MyMentors;