import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import {
  Search,
  SchoolOutlined,
  TimelineOutlined,
  FilterList,
  CheckCircle,
  AccountCircleOutlined,
  Launch
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ANavbar from './ANavbar';

import { getMentorshipRequests } from '../api';

const MyMentees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Branding Colors
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const data = await getMentorshipRequests();
        setMentees(data.filter(r => r.status === 'accepted'));
      } catch (error) {
        console.error("Failed to fetch mentees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const filteredMentees = mentees.filter(m =>
    m.student_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.student_dept?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Typography sx={{ p: 5, mt: 10 }}>Loading mentees...</Typography>;

  return (
    <>
      <ANavbar />
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 8 }}>
        <Container maxWidth="lg" sx={{ pt: 12 }}>

          {/* Page Header */}
          <Box sx={{ mb: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight="900" sx={{ color: deepZinc, letterSpacing: -1.5 }}>
                  My Mentees
                </Typography>
                <Typography variant="body1" color={mutedZinc} sx={{ mt: 0.5 }}>
                  Manage your active students and track their career progress.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  size="small"
                  placeholder="Search mentees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: glassBorder }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: mutedZinc, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton sx={{ border: `1px solid ${glassBorder}`, borderRadius: '12px' }}>
                  <FilterList sx={{ color: deepZinc }} />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          {/* Stats Summary */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: `1px solid ${glassBorder}`, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="900" color={primaryBrand}>{mentees.length}</Typography>
                <Typography variant="caption" fontWeight="700" color={mutedZinc}>TOTAL MENTEES</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Mentees Grid */}
          <Grid container spacing={3}>
            {filteredMentees.map((mentee) => (
              <Grid item xs={12} md={6} lg={4} key={mentee.id}>
                <Card elevation={0} sx={{
                  borderRadius: '24px',
                  border: `1px solid ${glassBorder}`,
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                    borderColor: primaryBrand
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: `${primaryBrand}10`,
                          color: primaryBrand,
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          border: `1px solid ${primaryBrand}20`
                        }}
                      >
                        {mentee.student_full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          bgcolor: `${primaryBrand}10`,
                          color: primaryBrand,
                          borderRadius: '8px'
                        }}
                      />
                    </Stack>

                    <Box mb={3}>
                      <Typography variant="h6" fontWeight="900" color={deepZinc}>
                        {mentee.student_full_name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <SchoolOutlined sx={{ fontSize: 16, color: mutedZinc }} />
                        <Typography variant="body2" color={mutedZinc} fontWeight="500">
                          {mentee.student_dept}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed', borderColor: glassBorder }} />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" fontWeight="800" color={mutedZinc} sx={{ letterSpacing: 1 }}>
                          FOCUS AREA
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                          {mentee.mentorship_types_details?.map(type => (
                            <Chip
                              key={type.id}
                              label={type.name}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: '6px' }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<Launch />}
                        onClick={() => navigate(`/menteeactivities/${mentee.id}`)}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1,
                          borderColor: glassBorder,
                          color: deepZinc,
                          '&:hover': {
                            borderColor: primaryBrand,
                            bgcolor: `${primaryBrand}05`
                          }
                        }}
                      >
                        Manage Activities
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {filteredMentees.length === 0 && (
              <Grid item xs={12} >
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <AccountCircleOutlined sx={{ fontSize: 60, color: glassBorder, mb: 2 }} />
                  <Typography variant="h6" fontWeight="800" color={mutedZinc}>No mentees found</Typography>
                  <Typography variant="body2" color={mutedZinc}>You haven't accepted any mentorship requests yet.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default MyMentees;