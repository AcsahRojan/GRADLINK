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
  Paper,
} from '@mui/material';
import {
  MessageOutlined,
  SchoolOutlined,
  CheckCircleOutline,
  HighlightOff,
  EventNoteOutlined,
  PersonOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ANavbar from './ANavbar';
import { getMentorshipRequests, acceptMentorshipRequest, rejectMentorshipRequest } from '../api';

const MenteeRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Color Palette
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getMentorshipRequests();
        // Alumni only sees pending requests in this particular manage view usually
        // but let's filter for pending just in case
        setRequests(data.filter(r => r.status === 'pending'));
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await acceptMentorshipRequest(id);
        alert("Request accepted!");
      } else {
        await rejectMentorshipRequest(id);
        alert("Request declined.");
      }
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error("Action failed", error);
      alert("Failed to process request.");
    }
  };

  if (loading) return <Typography sx={{ p: 5, mt: 10 }}>Loading requests...</Typography>;

  return (
    <>
      <ANavbar />
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 8 }}>
        <Container maxWidth="lg" sx={{ pt: 10 }}>

          {/* Page Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight="900" sx={{ color: deepZinc, letterSpacing: -1.5 }}>
              Mentorship Requests
            </Typography>
            <Typography variant="body1" color={mutedZinc} sx={{ mt: 0.5 }}>
              Review students' requests and choose who you'd like to mentor.
            </Typography>
          </Box>

          {/* Request List */}
          <Grid container spacing={3}>
            {requests.map((request) => (
              <Grid item xs={12} key={request.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: `1px solid ${glassBorder}`,
                    transition: '0.2s',
                    '&:hover': {
                      borderColor: primaryBrand,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Grid container spacing={3} alignItems="flex-start">
                      {/* Student Info */}
                      <Grid item xs={12} md={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: `${primaryBrand}10`,
                              color: primaryBrand,
                              fontWeight: 800,
                              border: `1px solid ${primaryBrand}20`
                            }}
                          >
                            {request.student_full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="900" color={deepZinc}>
                              {request.student_full_name}
                            </Typography>
                            <Typography variant="caption" color={mutedZinc} fontWeight="700">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack spacing={1} mt={3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <SchoolOutlined sx={{ fontSize: 16, color: mutedZinc }} />
                            <Typography variant="caption" fontWeight="600" color={mutedZinc}>
                              {request.student_dept}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {request.mentorship_types_details?.map(t => (
                              <Chip
                                key={t.id}
                                label={t.name}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.65rem',
                                  bgcolor: '#f1f5f9',
                                  borderRadius: '8px',
                                  mb: 0.5
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </Grid>

                      {/* Message Content */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{
                          p: 3,
                          bgcolor: '#f8fafc',
                          borderRadius: '20px',
                          height: '100%',
                          position: 'relative',
                          border: `1px solid ${glassBorder}`
                        }}>
                          <MessageOutlined sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(0,0,0,0.05)', fontSize: 40 }} />
                          <Typography variant="caption" fontWeight="800" color={primaryBrand} sx={{ display: 'block', mb: 1 }}>
                            STUDENT MESSAGE
                          </Typography>
                          <Typography variant="body2" color={deepZinc} sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                            "{request.message}"
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Actions */}
                      <Grid item xs={12} md={3}>
                        <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'center' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            startIcon={<CheckCircleOutline />}
                            onClick={() => handleAction(request.id, 'accept')}
                            sx={{
                              bgcolor: primaryBrand,
                              color: '#fff',
                              borderRadius: '12px',
                              py: 1.2,
                              textTransform: 'none',
                              fontWeight: 800,
                              '&:hover': { bgcolor: '#4f46e5' }
                            }}
                          >
                            Accept Request
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<HighlightOff />}
                            onClick={() => handleAction(request.id, 'reject')}
                            sx={{
                              borderColor: glassBorder,
                              color: '#ef4444',
                              borderRadius: '12px',
                              py: 1.2,
                              textTransform: 'none',
                              fontWeight: 800,
                              '&:hover': {
                                borderColor: '#ef4444',
                                bgcolor: '#fef2f2'
                              }
                            }}
                          >
                            Decline
                          </Button>
                          <Button
                            fullWidth
                            startIcon={<PersonOutline />}
                            sx={{
                              color: mutedZinc,
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}
                          >
                            View Student Profile
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {requests.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 12 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'inline-flex',
                      p: 3,
                      borderRadius: '50%',
                      bgcolor: '#f8fafc',
                      mb: 3
                    }}
                  >
                    <CheckCircleOutline sx={{ fontSize: 48, color: '#10b981' }} />
                  </Paper>
                  <Typography variant="h5" fontWeight="900" color={deepZinc}>
                    All caught up!
                  </Typography>
                  <Typography variant="body1" color={mutedZinc}>
                    There are no pending mentorship requests at the moment.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box >
    </>
  );
};

export default MenteeRequests;