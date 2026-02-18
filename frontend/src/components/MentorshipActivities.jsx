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
  Divider,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Description,
  RecordVoiceOver,
  Lightbulb,
  CheckCircle,
  Schedule,
  CloudUpload,
  Stars,
  Verified,
  Business,
  DeleteOutline
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import SNavbar from './SNavbar';
import { getMentorshipActivities, getMentorshipRequests, createMentorshipActivity, deleteMentorshipActivity } from '../api';

const MentorshipActivities = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentorship, setMentorship] = useState(null);
  const [activities, setActivities] = useState([]);

  // Branding Colors
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = '#e4e4e7';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await getMentorshipRequests();
        const found = requests.find(r => r.id === parseInt(id));
        setMentorship(found);

        const actData = await getMentorshipActivities(id);
        setActivities(actData);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const StatusChip = ({ status }) => {
    let color = '#f59e0b';
    let bg = '#fffbeb';
    if (status === 'COMPLETED' || status === 'ACTIVE') {
      color = '#10b981';
      bg = '#ecfdf5';
    } else if (status === 'SCHEDULED') {
      color = '#3b82f6';
      bg = '#eff6ff';
    }
    return (
      <Chip
        label={status}
        size="small"
        sx={{ bgcolor: bg, color: color, fontWeight: 700, fontSize: '0.7rem' }}
      />
    );
  };

  if (loading) return <Typography sx={{ p: 5, mt: 10 }}>Loading journey...</Typography>;
  if (!mentorship) return <Typography sx={{ p: 5, mt: 10 }}>Mentorship not found.</Typography>;

  const mentorName = mentorship.alumni_full_name;
  const mentorRole = mentorship.alumni_role;
  const mentorCompany = mentorship.alumni_company;
  const mentorAvatar = mentorName?.split(' ').map(n => n[0]).join('').toUpperCase();
  const agreedTypes = mentorship.mentorship_types_details?.map(t => t.name) || [];

  return (
    <>
      <SNavbar />
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pt: 9, pb: 8 }}>
        <Container maxWidth="md">
          {/* Back Navigation */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 1, color: mutedZinc, textTransform: 'none', fontWeight: 600 }}
          >
            Back to My Mentors
          </Button>

          {/* Mentor Header Card */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '24px',
              border: `1px solid ${glassBorder}`,
              bgcolor: '#fff',
              mb: 4
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={mentorship.alumni_image ? (mentorship.alumni_image.startsWith('http') ? mentorship.alumni_image : `http://localhost:8000${mentorship.alumni_image}`) : ""}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: primaryBrand,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  boxShadow: `0 0 0 4px ${primaryBrand}15`
                }}
              >
                {mentorAvatar}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Typography variant="h5" fontWeight="900" color={deepZinc}>
                    {mentorName}
                  </Typography>
                  <Verified sx={{ color: primaryBrand, fontSize: 20 }} />
                </Stack>
                <Typography variant="body1" fontWeight="600" color={mutedZinc}>
                  {mentorRole} @ {mentorCompany}
                </Typography>
                <Stack direction="row" spacing={1} mt={1.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  {agreedTypes.map(type => (
                    <Chip key={type} label={type} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: deepZinc }}>
            Mentorship Journey
          </Typography>

          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: `1px dashed ${glassBorder}`, mb: 4, textAlign: 'center', bgcolor: 'transparent' }}>
            <Typography variant="subtitle1" fontWeight="800" mb={1}>Submit for Review</Typography>
            <Typography variant="body2" color={mutedZinc} mb={3}>Upload your resume, project work, or any document for your mentor to review.</Typography>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('mentorship_request', id);
                formData.append('title', `File Submission: ${file.name}`);
                formData.append('description', 'Student uploaded a file for review.');
                formData.append('file', file);
                formData.append('status', 'pending');

                try {
                  setLoading(true);
                  await createMentorshipActivity(formData);
                  // Refresh data
                  const actData = await getMentorshipActivities(id);
                  setActivities(actData);
                } catch (err) {
                  console.error("Upload failed", err);
                } finally {
                  setLoading(false);
                }
              }}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="contained"
                disableElevation
                startIcon={<CloudUpload />}
                sx={{ bgcolor: deepZinc, color: '#fff', borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 700 }}
              >
                Choose File & Upload
              </Button>
            </label>
          </Paper>

          <Stack spacing={3}>
            {activities.length === 0 ? (
              <Typography variant="body2" color={mutedZinc} sx={{ textAlign: 'center', py: 5 }}>
                No activities logged yet.
              </Typography>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${glassBorder}` }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: `${primaryBrand}10`, color: primaryBrand }}>
                          {activity.title.toLowerCase().includes('resume') ? <Description /> :
                            activity.title.toLowerCase().includes('interview') ? <RecordVoiceOver /> : <Lightbulb />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800">{activity.title}</Typography>
                          <Typography variant="caption" color={mutedZinc}>
                            {new Date(activity.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusChip status={activity.status.replace('_', ' ').toUpperCase()} />
                        {activity.status === 'pending' && activity.file && (
                          <Tooltip title="Delete Submission">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to delete this submission?")) {
                                  try {
                                    setLoading(true);
                                    await deleteMentorshipActivity(activity.id);
                                    const actData = await getMentorshipActivities(id);
                                    setActivities(actData);
                                  } catch (err) {
                                    console.error("Delete failed", err);
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>

                    {(activity.date || activity.meeting_link) && (
                      <Grid container spacing={2} mb={2}>
                        {activity.date && (
                          <Grid item xs={6}>
                            <Typography variant="caption" fontWeight="800" color={mutedZinc}>SCHEDULED FOR</Typography>
                            <Typography variant="body2" fontWeight="700">
                              {new Date(activity.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </Typography>
                          </Grid>
                        )}
                        {activity.meeting_link && (
                          <Grid item xs={6}>
                            <Typography variant="caption" fontWeight="800" color={mutedZinc}>LOCATION/LINK</Typography>
                            <Typography variant="body2" fontWeight="700" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {activity.meeting_link}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}

                    {activity.description && (
                      <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '12px', mb: 2 }} elevation={0}>
                        <Typography variant="body2" color={mutedZinc} sx={{ lineHeight: 1.7 }}>
                          {activity.description}
                        </Typography>
                      </Paper>
                    )}

                    {activity.meeting_link && (
                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        href={activity.meeting_link}
                        target="_blank"
                        sx={{ bgcolor: primaryBrand, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Join Meeting
                      </Button>
                    )}

                    {activity.file && (
                      <Button
                        startIcon={<Description />}
                        fullWidth
                        variant="outlined"
                        href={activity.file.startsWith('http') ? activity.file : `http://localhost:8000${activity.file}`}
                        target="_blank"
                        sx={{ mt: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                      >
                        View Attached File
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default MentorshipActivities;