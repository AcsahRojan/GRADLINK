import React, { useState, useEffect } from 'react';
import SNavbar from './SNavbar.jsx';
import { getAlumni, getMentorshipActivities } from '../api';
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Stack,
  Avatar,
  Chip,
  Paper,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Event,
  AutoGraph,
  ArrowForward,
  Group,
} from '@mui/icons-material';

import { useNavigate, Link } from 'react-router-dom';

const StudentHome = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mentors, setMentors] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [alumniData, activitiesData] = await Promise.all([
          getAlumni(),
          getMentorshipActivities() // Fetch activities
        ]);

        // Process alumni: add initials and limit to 4
        const processedMentors = (alumniData.results || alumniData)
          .slice(0, 4)
          .map(alum => ({
            ...alum,
            initials: alum.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          }));

        setMentors(processedMentors);

        // Process sessions: find the first scheduled one
        const sessions = activitiesData.results || activitiesData;
        const scheduledSession = sessions.find(s => s.status === 'scheduled');
        if (scheduledSession) {
          setNextSession(scheduledSession);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  if (!user) {
    return <h3>Please login again</h3>;
  }

  return (
    <>
      <SNavbar />
      <Box sx={{ bgcolor: '#fcfcfd', minHeight: '100vh', pb: { xs: 6, sm: 8, md: 10 } }}>

        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 10, sm: 12, md: 14 },
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{ flexDirection: 'column' }}
          >

            <Grid item xs={12} lg={8}>
              {/* Welcome Banner */}
              <Box
                onMouseMove={handleMouseMove}
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderRadius: '25px',
                  bgcolor: deepZinc,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: { xs: 2.5, sm: 3, md: 4 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.15), transparent 80%)`,
                    zIndex: 1,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Welcome back, {user.first_name}! 👋
                  </Typography>

                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: { xs: 200, sm: 250, md: 300 },
                    height: { xs: 200, sm: 250, md: 300 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${primaryBrand} 0%, transparent 70%)`,
                    opacity: 0.3
                  }}
                />
              </Box>


              {/* Recommended Mentors Section */}
              <Box
                sx={{
                  pt: 4,
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="800"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.75rem' }
                  }}
                >
                  Recommended Mentors
                </Typography>
                <Button
                  href='/findalumni'
                  endIcon={<ArrowForward />}
                  sx={{
                    color: primaryBrand,
                    fontWeight: 700,
                    fontSize: { xs: '0.85rem', md: '1rem' }
                  }}
                >
                  See All
                </Button>
              </Box>

              {/* Mentors Grid */}
              <Grid
                item xs={12} lg={4}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                  gap: 4,
                  borderRadius: '20px',
                  border: loading ? 'none' : `1px solid ${glassBorder}`,
                  p: loading ? 0 : { xs: 3, sm: 3.5, md: 4 },
                }}>
                {loading ? (
                  <Typography variant="body2" color={mutedZinc}>Loading recommended mentors...</Typography>
                ) : mentors.length > 0 ? mentors.map((mentor, i) => (
                  <Card
                    key={mentor.id}
                    elevation={0}
                    sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '20px',
                      border: `1px solid ${glassBorder}`,
                      transition: '0.3s',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: primaryBrand
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Avatar
                            src={mentor.image ? `http://localhost:8000${mentor.image}` : ''}
                            sx={{
                              width: { xs: 48, md: 56 },
                              height: { xs: 48, md: 56 },
                              bgcolor: primaryBrand,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: { xs: '0.9rem', md: '1.1rem' }
                            }}
                          >
                            {!mentor.image && mentor.initials}
                          </Avatar>
                        </Stack>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="800"
                            sx={{
                              lineHeight: 1.2,
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            {mentor.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={mutedZinc}
                            sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                          >
                            {mentor.role} @ {mentor.company}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                          {mentor.skills?.slice(0, 3).map(skill => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{
                                fontSize: { xs: '0.6rem', md: '0.7rem' },
                                borderRadius: '6px',
                                height: 'fit-content'
                              }}
                            />
                          ))}
                        </Stack>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate(`/alumniprofile/${mentor.id}`)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            color: primaryBrand,
                            bgcolor: deepZinc,
                            borderColor: glassBorder,
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            py: { xs: 0.75, md: 1 },
                            '&:hover': { bgcolor: `${primaryBrand}08` }
                          }}
                        >
                          View Profile
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )) : (
                  <Typography variant="body2" color={mutedZinc}>No recommended mentors found.</Typography>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12} lg={4}>
              {/* Next Session */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 3.5, md: 4 },
                  borderRadius: '24px',
                  border: `1px solid ${glassBorder}`,
                  mb: { xs: 2.5, sm: 3, md: 4 }
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="800"
                  sx={{
                    mb: { xs: 2, md: 3 },
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}
                >
                  Next Session
                </Typography>

                {nextSession ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 2, md: 2.5 },
                      borderRadius: '16px',
                      bgcolor: '#f8fafc',
                      border: `1px solid ${glassBorder}`
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={{ xs: 1.5, md: 2 }}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          p: { xs: 1, md: 1.5 },
                          borderRadius: '12px',
                          bgcolor: 'white',
                          textAlign: 'center',
                          minWidth: { xs: 50, md: 60 }
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight="800"
                          display="block"
                          color={primaryBrand}
                          sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                        >
                          {new Date(nextSession.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="800"
                          sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                        >
                          {new Date(nextSession.date).getDate()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        >
                          {nextSession.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={mutedZinc}
                          sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                        >
                          {nextSession.alumni_name} • {new Date(nextSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      fullWidth
                      variant="contained"
                      href={nextSession.meeting_link}
                      target="_blank"
                      sx={{
                        mt: { xs: 1.5, md: 2 },
                        bgcolor: deepZinc,
                        borderRadius: '8px',
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        py: { xs: 0.75, md: 1 },
                        '&:hover': { bgcolor: '#000' }
                      }}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color={mutedZinc}>No upcoming sessions scheduled.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default StudentHome;