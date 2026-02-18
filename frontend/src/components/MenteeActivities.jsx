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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AssignmentOutlined,
  CheckCircle,
  RadioButtonUnchecked,
  MoreVert,
  ChatBubbleOutline,
  Update,
  SchoolOutlined,
  ArrowBack,
  SaveOutlined
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ANavbar from './ANavbar';
import { getMentorshipActivities, getMentorshipRequests, createMentorshipActivity, updateMentorshipActivity } from '../api';

const MenteeActivities = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentorship, setMentorship] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("Feedback Note");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Color Palette
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      await updateMentorshipActivity(activityId, { status: newStatus.toLowerCase().replace(' ', '_') });
      setActivities(prev => prev.map(act => act.id === activityId ? { ...act, status: newStatus.toLowerCase().replace(' ', '_') } : act));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAddActivity = async () => {
    if (!newNote) return;
    try {
      await createMentorshipActivity({
        mentorship_request: id,
        title: newTitle,
        description: newNote,
        status: 'completed'
      });
      setNewNote("");
      setNewTitle("Feedback Note");
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to add activity", error);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingDate || !meetingLink) {
      alert("Please provide both a date and a meeting link.");
      return;
    }

    let finalLink = meetingLink;
    if (!finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
      finalLink = 'https://' + finalLink;
    }

    setIsScheduling(true);
    try {
      await createMentorshipActivity({
        mentorship_request: id,
        title: "Scheduled Mentorship Session",
        description: "A formal mentorship session has been scheduled.",
        date: meetingDate,
        meeting_link: finalLink,
        status: 'scheduled'
      });
      setMeetingDate("");
      setMeetingLink("");
      fetchData();
      alert("Meeting scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule meeting", error);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert("Failed to schedule meeting: " + errorMsg);
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) return <Typography sx={{ p: 5, mt: 10 }}>Loading activities...</Typography>;
  if (!mentorship) return <Typography sx={{ p: 5, mt: 10 }}>Mentorship not found.</Typography>;

  const studentName = mentorship.student_full_name;
  const studentDept = mentorship.student_dept;
  const studentAvatar = studentName?.split(' ').map(n => n[0]).join('').toUpperCase();
  const mentorshipTypeLabel = mentorship.mentorship_types_details?.map(t => t.name).join(' & ');

  return (
    <>
      <ANavbar />
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
        <Container maxWidth="lg" sx={{ pt: 8 }}>

          {/* Navigation & Header */}
          <Box sx={{ mb: 6 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/mymentees')}
              sx={{ color: mutedZinc, textTransform: 'none', fontWeight: 700, mb: 1 }}
            >
              Back to Mentees
            </Button>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                border: `1px solid ${glassBorder}`,
                bgcolor: `${primaryBrand}05`
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Avatar
                  src={mentorship.student_image ? (mentorship.student_image.startsWith('http') ? mentorship.student_image : `http://localhost:8000${mentorship.student_image}`) : ""}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: primaryBrand,
                    fontSize: '2rem',
                    fontWeight: 800
                  }}
                >
                  {studentAvatar}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h4" fontWeight="900" color={deepZinc} sx={{ letterSpacing: -1 }}>
                    {studentName}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                    mt={0.5}
                  >
                    <SchoolOutlined sx={{ fontSize: 18, color: mutedZinc }} />
                    <Typography variant="body1" color={mutedZinc} fontWeight="500">
                      {studentDept}
                    </Typography>
                  </Stack>
                  <Chip
                    label={mentorshipTypeLabel}
                    size="small"
                    sx={{
                      mt: 2,
                      fontWeight: 800,
                      bgcolor: deepZinc,
                      color: '#fff',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Grid container spacing={4}>
            {/* Activities Timeline */}
            <Grid item xs={12} lg={8}>
              <Typography variant="h6" fontWeight="900" color={deepZinc} mb={3}>
                Mentorship Timeline
              </Typography>

              {activities.length === 0 && (
                <Typography variant="body1" color={mutedZinc}>No activities logged yet.</Typography>
              )}

              <Stepper orientation="vertical" nonLinear sx={{ ml: 1 }}>
                {activities.map((activity, index) => (
                  <Step key={activity.id} active={true} expanded={true}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box sx={{ color: activity.status === 'completed' ? primaryBrand : mutedZinc }}>
                          {activity.status === 'completed' ? <CheckCircle /> : <RadioButtonUnchecked />}
                        </Box>
                      )}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="800" color={deepZinc}>
                          {activity.title}
                        </Typography>
                        <TextField
                          select
                          size="small"
                          value={activity.status.toUpperCase().replace('_', ' ')}
                          onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                          sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }
                          }}
                        >
                          <MenuItem value="PENDING">Pending</MenuItem>
                          <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                          <MenuItem value="COMPLETED">Completed</MenuItem>
                          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                        </TextField>
                      </Stack>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2, mt: 1 }}>
                        <Typography variant="caption" fontWeight="700" color={mutedZinc}>
                          {new Date(activity.created_at).toLocaleString()}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mt: 1,
                            bgcolor: '#f8fafc',
                            borderRadius: '12px',
                            border: `1px solid ${glassBorder}`
                          }}
                        >
                          <Typography variant="body2" color={deepZinc} sx={{ whiteSpace: 'pre-line' }}>
                            {activity.description || "No specific notes provided yet."}
                          </Typography>
                          {activity.meeting_link && (
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: primaryBrand, fontWeight: 700 }}>
                              Meeting Link: {activity.meeting_link}
                            </Typography>
                          )}
                        </Paper>

                        {activity.file && activity.status === 'pending' && (
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              rows={2}
                              placeholder="Write your review feedback..."
                              id={`review-${activity.id}`}
                              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              disableElevation
                              sx={{ bgcolor: '#10b981', color: '#fff', textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                              onClick={async () => {
                                const feedback = document.getElementById(`review-${activity.id}`).value;
                                if (!feedback) return;
                                try {
                                  await updateMentorshipActivity(activity.id, {
                                    description: feedback,
                                    status: 'completed'
                                  });
                                  fetchData();
                                } catch (err) {
                                  console.error("Review failed", err);
                                }
                              }}
                            >
                              Submit Review & Complete
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Grid>

            {/* Scheduling & Feedback */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: `1px solid ${glassBorder}`,
                  mb: 3
                }}
              >
                <Typography variant="h6" fontWeight="900" color={deepZinc} mb={1}>
                  Schedule Meeting
                </Typography>
                <Typography variant="body2" color={mutedZinc} mb={3}>
                  Set up a Zoom, Google Meet, or offline session with your mentee.
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Session Date & Time"
                    InputLabelProps={{ shrink: true }}
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Meeting Link / Location"
                    placeholder="e.g. meet.google.com/abc-defg"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    disabled={isScheduling}
                    sx={{
                      bgcolor: primaryBrand,
                      borderRadius: '12px',
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700
                    }}
                    onClick={handleScheduleMeeting}
                  >
                    {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: `1px solid ${glassBorder}`,
                  position: 'sticky',
                  top: 100
                }}
              >
                <Typography variant="h6" fontWeight="900" color={deepZinc} mb={1}>
                  Quick Feedback
                </Typography>
                <Typography variant="body2" color={mutedZinc} mb={3}>
                  Share meeting notes, resource links, or progress feedback with your mentee.
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Title"
                  placeholder="e.g. Resume Feedback"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Type your notes here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': { borderRadius: '16px' }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  startIcon={<SaveOutlined />}
                  sx={{
                    bgcolor: deepZinc,
                    color: '#fff',
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#000' }
                  }}
                  onClick={handleAddActivity}
                >
                  Update Mentee Log
                </Button>

                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                <Typography variant="subtitle2" fontWeight="800" color={deepZinc} mb={2}>
                  Mentee Shared Files
                </Typography>
                <Stack spacing={1.5}>
                  {activities.filter(a => a.file).map((activity) => (
                    <Stack
                      key={activity.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${glassBorder}` }}
                    >
                      <Typography variant="caption" fontWeight="700">
                        {activity.file.split('/').pop()}
                      </Typography>
                      <Button size="small" href={activity.file.startsWith('http') ? activity.file : `http://localhost:8000${activity.file}`} target="_blank">View</Button>
                    </Stack>
                  ))}
                  {activities.filter(a => a.file).length === 0 && (
                    <Typography variant="caption" color={mutedZinc}>No files uploaded yet.</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default MenteeActivities;