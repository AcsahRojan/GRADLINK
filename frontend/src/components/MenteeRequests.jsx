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
  Divider,
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
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: { xs: 6, sm: 8, md: 10 } }}>
        <Container maxWidth="xl" sx={{ pt: 10 }}>
          <Grid container spacing={4} display={'grid'} gridTemplateColumns={{ xs: '1fr', lg: '1fr 2fr' }}>

            {/* Left Sidebar */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                {/* Page Header / Summary */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${glassBorder}`, mb: 4, bgcolor: '#f8fafc' }}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: deepZinc, letterSpacing: -1.5, mb: 2 }}>
                    Mentorship Requests
                  </Typography>
                  <Typography variant="body2" color={mutedZinc} sx={{ mb: 3, fontWeight: 500, lineHeight: 1.6 }}>
                    Review students' requests and choose who you'd like to mentor. Your guidance builds the engineering leaders of tomorrow.
                  </Typography>

                  <Divider sx={{ my: 3, opacity: 0.6 }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="700" color={mutedZinc}>Pending Requests</Typography>
                      <Chip label={requests.length} size="small" sx={{ bgcolor: `${primaryBrand}10`, color: primaryBrand, fontWeight: 800 }} />
                    </Box>
                  </Stack>
                </Paper>

                {/* Mentor Tips Card */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventNoteOutlined fontSize="small" /> Mentor Checklist
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      "Check student's department & year",
                      "Review their personal message",
                      "Verify mentorship type alignment",
                      "View full profile before accepting"
                    ].map((tip, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: primaryBrand, mt: 0.8 }} />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{tip}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Grid>

            {/* Right Column: Request List */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: primaryBrand, borderRadius: 2 }} />
                  Active Inbound Requests
                </Typography>

                <Stack spacing={3}>
                  {requests.map((request) => (
                    <Card
                      key={request.id}
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
                        <Grid container spacing={3}>
                          {/* Student Basic Info */}
                          <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 56,
                                  height: 56,
                                  bgcolor: `${primaryBrand}10`,
                                  color: primaryBrand,
                                  fontWeight: 800,
                                  border: `1px solid ${primaryBrand}15`
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

                            <Stack spacing={1.5} mt={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolOutlined sx={{ fontSize: 18, color: mutedZinc }} />
                                <Typography variant="body2" fontWeight="600" color={mutedZinc}>
                                  {request.student_dept}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {request.mentorship_types_details?.map(t => (
                                  <Chip
                                    key={t.id}
                                    label={t.name}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: '0.65rem',
                                      bgcolor: '#f1f5f9',
                                      borderRadius: '6px'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Message Body */}
                          <Grid item xs={12} md={8}>
                            <Box sx={{
                              p: 3,
                              bgcolor: '#f8fafc',
                              borderRadius: '20px',
                              border: `1px solid ${glassBorder}`,
                              position: 'relative'
                            }}>
                              <MessageOutlined sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(0,0,0,0.03)', fontSize: 40 }} />
                              <Typography variant="caption" fontWeight="800" color={primaryBrand} sx={{ display: 'block', mb: 1.5 }}>
                                MISSION STATEMENT / MESSAGE
                              </Typography>
                              <Typography variant="body2" color={deepZinc} sx={{ lineHeight: 1.7, fontWeight: 500 }}>
                                "{request.message}"
                              </Typography>
                            </Box>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                              <Button
                                fullWidth
                                variant="contained"
                                disableElevation
                                startIcon={<CheckCircleOutline />}
                                onClick={() => handleAction(request.id, 'accept')}
                                sx={{ bgcolor: primaryBrand, borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                              >
                                Accept
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<HighlightOff />}
                                onClick={() => handleAction(request.id, 'reject')}
                                sx={{ borderColor: glassBorder, color: '#ef4444', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}
                              >
                                Decline
                              </Button>
                              
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  {requests.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#f8fafc', borderRadius: '32px', border: `1px dashed ${glassBorder}` }}>
                      <Paper
                        elevation={0}
                        sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: '#fff', mb: 3 }}
                      >
                        <CheckCircleOutline sx={{ fontSize: 48, color: '#10b981' }} />
                      </Paper>
                      <Typography variant="h5" fontWeight="900" color={deepZinc}>
                        All clear for now!
                      </Typography>
                      <Typography variant="body1" color={mutedZinc}>
                        No pending mentorship requests to display.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box >
    </>
  );
};

export default MenteeRequests;