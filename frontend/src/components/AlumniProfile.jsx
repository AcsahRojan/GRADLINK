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
  Paper,
  IconButton,
  TextField,
  Modal,
  Fade,
  Backdrop,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  ArrowBack,
  Verified,
  Business,
  School,
  WorkHistory,
  Psychology,
  Handshake,
  CalendarMonth,
  Close,
  Send,
  InfoOutlined,
  LinkedIn
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import SNavbar from './SNavbar';
import api, { getAlumniProfile, getMentorshipRequests, createMentorshipRequest } from '../api';

const AlumniProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // Branding Colors
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = '#e4e4e7';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getAlumniProfile(id);
        // Map backend data to frontend structure
        const profile = {
          name: `${data.first_name} ${data.last_name}`,
          role: data.alumni_profile?.job_title || "Alumni",
          company: data.alumni_profile?.current_company || "Graduate",
          dept: data.degree || "N/A",
          batch: data.batch_year || "N/A",
          avatar: data.first_name?.[0] + (data.last_name?.[0] || ""),
          skills: data.alumni_profile?.skills || [], // Assuming backend might provide this or we'll map it
          education: [
            { degree: data.degree, school: data.college, year: data.batch_year }
          ],
          summary: data.bio || "No bio provided.",
          mentoringTypes: data.alumni_profile?.available_for || [],
          isAvailable: data.alumni_profile?.willing_to_mentor || false,
          mentoringBio: data.bio || "",
          image: data.image,
          linkedin_url: data.alumni_profile?.linkedin_url || ""
        };
        setAlumni(profile);
      } catch (error) {
        console.error("Error fetching alumni profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const checkExistingRequests = async () => {
      try {
        const requests = await getMentorshipRequests();
        const existing = requests.find(r => r.alumni === parseInt(id) && (r.status === 'pending' || r.status === 'accepted'));
        if (existing) {
          setRequestSent(existing.status === 'pending');
          setIsAccepted(existing.status === 'accepted');
          setRequestId(existing.id);
        }
      } catch (error) {
        console.error("Error checking existing requests:", error);
      }
    };
    checkExistingRequests();
  }, [id]);

  if (loading) return <Typography sx={{ p: 5 }}>Loading profile...</Typography>;
  if (!alumni) return <Typography sx={{ p: 5 }}>Alumni not found.</Typography>;

  const alumniData = alumni;

  const handleToggleType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      alert("Please select at least one mentoring type.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMentorshipRequest({
        alumni: id,
        message: requestMessage,
        mentorship_types: selectedTypes
      });
      setRequestSent(true);
      setRequestModal(false);
      alert("Mentorship request sent successfully!");
    } catch (error) {
      console.error("Failed to send request", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SNavbar />
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pt: 8, pb: 8 }}>
        <Container maxWidth="lg">
          {/* Navigation */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 1, color: mutedZinc, textTransform: 'none', fontWeight: 600 }}
          >
            Back to Alumni List
          </Button>

          <Grid container spacing={4}>
            {/* Left Column: Basic Info & Actions */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card elevation={0} sx={{ borderRadius: '24px', border: `1px solid ${glassBorder}`, textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Avatar
                      src={alumniData.image ? (alumniData.image.startsWith('http') ? alumniData.image : `http://localhost:8000${alumniData.image}`) : ''}
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: primaryBrand,
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 0 0 6px ${primaryBrand}10`
                      }}
                    >
                      {!alumniData.image && alumniData.avatar}
                    </Avatar>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      
                    </Stack>
                    <Typography variant="body1" fontWeight="600" color={mutedZinc} sx={{ mb: 1 }}>
                      {alumniData.role}
                    </Typography>

                    {alumniData.linkedin_url && (
                      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
                        <IconButton
                          href={alumniData.linkedin_url}
                          target="_blank"
                          size="small"
                          sx={{
                            color: deepZinc,
                            border: '1px solid rgba(228, 228, 231, 0.6)',
                            borderRadius: '8px',
                            '&:hover': { borderColor: primaryBrand, color: primaryBrand }
                          }}
                        >
                          <LinkedIn fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}

                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Business sx={{ color: mutedZinc, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="700">{alumniData.company}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <School sx={{ color: mutedZinc, fontSize: 20 }} />
                        <Typography variant="body2" color={mutedZinc}>
                          {alumniData.dept} • <span style={{ fontWeight: 700, color: deepZinc }}>Class of {alumniData.batch}</span>
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 4 }}>
                      {!isAccepted ? (
                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          disabled={!alumniData.isAvailable || requestSent}
                          onClick={() => setRequestModal(true)}
                          sx={{
                            bgcolor: deepZinc,
                            py: 1.5,
                            borderRadius: '12px',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#18181b' }
                          }}
                        >
                          {requestSent ? 'Request Pending' : 'Request Mentorship'}
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate(`/mentorshipactivities/${requestId}`)}
                          sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
                        >
                          View Active Mentorship
                        </Button>
                      )}
                      {!alumniData.isAvailable && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                          Currently not accepting new mentees
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.03)', border: `1px solid ${primaryBrand}20` }}>
                  <Stack direction="row" spacing={1} mb={1}>
                    <InfoOutlined sx={{ fontSize: 18, color: primaryBrand }} />
                    <Typography variant="subtitle2" fontWeight="800" color={primaryBrand}>Mentorship Note</Typography>
                  </Stack>
                  <Typography variant="body2" color={mutedZinc} lineHeight={1.6}>
                    {alumniData.mentoringBio}
                  </Typography>
                </Paper> */}
              </Stack>
            </Grid>

            {/* Right Column: Detailed Bio */}
            <Grid item xs={12} md={8}>
              <Stack spacing={4}>
                {/* Career Summary */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <WorkHistory sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800">Mentorship note</Typography>
                  </Stack>
                  <Typography variant="body1" color={mutedZinc} sx={{ lineHeight: 1.8 }}>
                    {alumniData.summary}
                  </Typography>
                </Box>

                {/* Skills */}
                {/* <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Psychology sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800">Skills</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {alumniData.skills.map(skill => (
                      <Chip key={skill} label={skill} sx={{ fontWeight: 600, bgcolor: '#fff', border: `1px solid ${glassBorder}` }} />
                    ))}
                  </Stack>
                </Box> */}

                {/* Education */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <School sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800">Education</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {alumniData.education.map((edu, idx) => (
                      <Box key={idx} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBorder}` }}>
                        <Typography variant="subtitle2" fontWeight="800">{edu.degree}</Typography>
                        <Typography variant="caption" color={mutedZinc} fontWeight="600">{edu.school} • {edu.year}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Mentoring Offered */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Handshake sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800">Mentoring Services</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {alumniData.mentoringTypes.map(type => (
                      <Grid item xs={12} sm={6} key={type.id || type}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px', border: `1px solid ${glassBorder}` }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: primaryBrand }} />
                          <Typography variant="body2" fontWeight="700">{type.name || type}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* Mentorship Request Modal */}
        <Modal
          open={requestModal}
          onClose={() => setRequestModal(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={requestModal}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 500 },
              bgcolor: '#fff',
              borderRadius: '24px',
              boxShadow: 24,
              p: 4,
              outline: 'none'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="900">Request Mentorship</Typography>
                <IconButton onClick={() => setRequestModal(false)} size="small"><Close /></IconButton>
              </Stack>

              <form onSubmit={handleRequestSubmit}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, color: mutedZinc }}>
                  SELECT MENTORING TYPES
                </Typography>
                <FormGroup sx={{ mb: 3 }}>
                  <Grid container>
                    {alumniData.mentoringTypes.map(type => (
                      <Grid item xs={6} key={type.id || type}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedTypes.includes(type.id)}
                              onChange={() => handleToggleType(type.id)}
                              sx={{ color: primaryBrand, '&.Mui-checked': { color: primaryBrand } }}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="600">{type.name || type}</Typography>}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>

                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: mutedZinc }}>
                  PERSONAL MESSAGE (OPTIONAL)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Briefly introduce yourself and explain what you hope to learn..."
                  variant="outlined"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disableElevation
                  endIcon={<Send />}
                  disabled={isSubmitting}
                  sx={{ bgcolor: primaryBrand, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </form>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </>
  );
};

export default AlumniProfile;