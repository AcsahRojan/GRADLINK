import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Typography,
  Stack,
  Paper,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Group,
  ArrowForward,
  WorkOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ANavbar from './ANavbar';

const AlumniHome = () => {
  const navigate = useNavigate();
  const primaryBrand = '#2563eb';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    total_mentees: 0,


  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Fetch dashboard data on component mount
  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch dashboard stats
        console.log("Token:", token);
        const statsResponse = await fetch('http://localhost:8000/api/alumni/dashboard-stats/', {
          headers
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData);
        }

        // Fetch pending mentorship requests
        const requestsResponse = await fetch('http://localhost:8000/api/mentorship-requests/?status=pending', {
          headers
        });
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          // Filter only pending requests and limit to 2 for display
          const pending = requestsData.filter(req => req.status === 'pending').slice(0, 2);
          setPendingRequests(pending);
        }

        // Fetch upcoming scheduled activities
        const activitiesResponse = await fetch('http://localhost:8000/api/mentorship-activities/?status=scheduled', {
          headers
        });
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          // Limit to 2 upcoming sessions
          setUpcomingSessions(activitiesData.slice(0, 2));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Impact stats using dynamic data
  const impactStats = [
    { label: 'Total Mentees', value: dashboardStats.total_mentees.toString(), icon: <Group />, color: primaryBrand },


  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate()
    };
  };

  // Helper function to get initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <>
        <ANavbar />
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <ANavbar />
      <Box sx={{ pb: { xs: 6, sm: 8, md: 10 } }}>

        <Container maxWidth="xl" sx={{ pt: 10 }}>
          <Grid container spacing={4} display={'grid'} gridTemplateColumns={{ xs: '1fr', lg: '1fr 2fr' }}>
            {/* Left Sidebar */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                {/* Header / Profile Summary */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${glassBorder}`, mb: 4, background: '#fff', textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100, bgcolor: deepZinc, mx: 'auto', mb: 2 }}
                    src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000${user.image}`) : ''}
                  >{user?.first_name?.charAt(0) || 'U'}{user?.last_name?.charAt(0) || 'U'}</Avatar>
                  <Typography variant="h5" fontWeight="800">Welcome back, {user?.first_name} {user?.last_name}</Typography>
                  <Typography variant="body2" color={mutedZinc} sx={{ mb: 2 }}>
                    {user?.alumni_profile?.job_title || 'Alumni'} @ {user?.alumni_profile?.current_company || 'Professional'}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'center', mb: 2 }}>
                    {user?.alumni_profile?.job_title && (
                      <Chip label={user.alumni_profile.job_title} size="small" icon={<WorkOutline sx={{ fontSize: '14px !important' }} />} sx={{ fontWeight: 600 }} />
                    )}
                    {user?.alumni_profile?.willing_to_mentor && (
                      <Chip label="Available for Mentorship" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                    )}
                  </Stack>
                </Paper>

                {/* Career Growth / Resources */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${glassBorder}`, bgcolor: '#fff', mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Mentor Tools</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Referral Dashboard', icon: <ArrowForward fontSize="small" />, path: "/alumnijobs" },
                      { label: 'Review Student Resumes', icon: <ArrowForward fontSize="small" />, path: "/mymentees" },
                    ].map((item, i) => (
                      <Button
                        key={i}
                        fullWidth
                        onClick={() => navigate(item.path)}
                        variant="text"
                        endIcon={item.icon}
                        sx={{
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          color: deepZinc,
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: '12px',
                          border: '1px solid transparent',
                          '&:hover': { bgcolor: '#f8fafc', borderColor: glassBorder }
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Stack>
                </Paper>

                {/* Impact Quote */}
                <Box sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic', mb: 2 }}>
                    "The mentorship you provide today builds the engineering leaders of tomorrow."
                  </Typography>
                  <Typography variant="caption" fontWeight="700">— GradLink Community</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              {/* Impact Metrics */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Your Impact</Typography>
                <Grid container spacing={3}>
                  {impactStats.map((stat, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', gap: 3, bgcolor: '#fff' }}>
                        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '12px', bgcolor: `${stat.color}15`, color: stat.color }}>
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="800">{stat.value}</Typography>
                          <Typography variant="caption" color={mutedZinc} fontWeight="700" sx={{ textTransform: 'uppercase' }}>{stat.label}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 6, opacity: 0.6 }} />

              {/* Upcoming Mentorship Sessions */}
              <Box sx={{ mb: 6 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 24, bgcolor: primaryBrand, borderRadius: 2 }} />
                    Upcoming Sessions
                  </Typography>
                  <Button size="small" sx={{ fontWeight: 700, textTransform: 'none' }}>View Calendar</Button>
                </Box>

                <Stack spacing={2}>
                  {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => {
                    const dateInfo = formatDate(session.date);
                    return (
                      <Card key={session.id} elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${glassBorder}` }}>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={2}>
                              <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f1f5f9', borderRadius: '12px' }}>
                                <Typography variant="caption" fontWeight="800" color={primaryBrand}>{dateInfo.month}</Typography>
                                <Typography variant="h6" fontWeight="800">{dateInfo.day}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body1" fontWeight="700">{session.title}</Typography>
                              <Typography variant="caption" color={mutedZinc}>{session.description || 'Mentorship Session'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                              {session.meeting_link ? (
                                <Button
                                  variant="contained"
                                  sx={{ bgcolor: deepZinc, borderRadius: '8px', textTransform: 'none' }}
                                  href={session.meeting_link}
                                  target="_blank"
                                >
                                  Launch Meeting
                                </Button>
                              ) : (
                                <Chip label="Scheduled" size="small" color="primary" />
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  }) : (
                    <Typography variant="body2" color={mutedZinc} sx={{ textAlign: 'center', py: 3, bgcolor: '#fff', borderRadius: '20px', border: `1px solid ${glassBorder}` }}>
                      No upcoming sessions scheduled yet.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ my: 6, opacity: 0.6 }} />

              {/* Mentorship Requests */}
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 24, bgcolor: primaryBrand, borderRadius: 2 }} />
                    Pending Requests
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {pendingRequests.length > 0 ? pendingRequests.map((req, i) => (
                    <Grid item xs={12} sm={6} key={req.id}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#fff', border: `1px solid ${glassBorder}` }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                          <Avatar sx={{ bgcolor: primaryBrand, width: 48, height: 48 }}>
                            {getInitials(req.student_full_name.split(' ')[0], req.student_full_name.split(' ')[1])}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="800">{req.student_full_name}</Typography>
                            <Typography variant="caption" color={mutedZinc}>{req.student?.college || 'Student'} • {req.student_dept}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                          <Button fullWidth variant="contained" sx={{ bgcolor: primaryBrand, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>Accept</Button>
                          <Button fullWidth variant="outlined" sx={{ borderRadius: '10px', color: mutedZinc, textTransform: 'none', fontWeight: 700 }}>Decline</Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color={mutedZinc} sx={{ textAlign: 'center', py: 4, bgcolor: '#fff', borderRadius: '20px', border: `1px solid ${glassBorder}` }}>
                        No pending requests at the moment.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AlumniHome;