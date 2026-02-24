import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Avatar,
  Button,
  Grid,
  Divider,
  IconButton,
  TextField,
  Modal,
  Fade,
  Backdrop,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Business,
  School,
  WorkHistory,
  Handshake,
  Close,
  Send,
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
      <Box sx={{ bgcolor: '#fcfcfd', minHeight: '100vh', pt: { xs: 2, md: 4 }, pb: 8 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, md: 4 } }}>
          {/* Navigation */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, color: mutedZinc, textTransform: 'none', fontWeight: 600, '&:hover': { color: deepZinc } }}
          >
            Back to Alumni List
          </Button>

          <Grid container spacing={{ xs: 2, md: 4 }} display={'grid'} gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }}>
            {/* Left Column: Basic Info & Actions */}
            <Grid item xs={12} md={5} lg={4}>
              <Paper elevation={0} sx={{
                borderRadius: { xs: '16px', md: '24px' },
                border: '1px solid rgba(228, 228, 231, 0.6)',
                overflow: 'hidden',
                position: 'sticky',
                top: { lg: 100 }
              }}>
                <Box sx={{
                  height: { xs: 100, md: 140 },
                  bgcolor: deepZinc,
                  position: 'relative'
                }} />

                <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 5 }, mt: { xs: -5, md: -7 }, textAlign: 'center' }}>
                  <Avatar
                    src={alumniData.image ? (alumniData.image.startsWith('http') ? alumniData.image : `http://localhost:8000${alumniData.image}`) : ''}
                    sx={{
                      width: { xs: 90, md: 130 },
                      height: { xs: 90, md: 130 },
                      margin: '0 auto',
                      border: '5px solid white',
                      bgcolor: primaryBrand,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      fontWeight: 800
                    }}
                  >
                    {!alumniData.image && alumniData.avatar}
                  </Avatar>

                  <Typography variant="h6" fontWeight="800" sx={{
                    mt: { xs: 1.5, md: 3 },
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}>
                    {alumniData.name}
                  </Typography>

                  <Typography variant="body2" color={mutedZinc} fontWeight="500" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, mt: 0.5 }}>
                    {alumniData.role} @ {alumniData.company}
                  </Typography>

                  {alumniData.linkedin_url && (
                    <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: { xs: 1.5, md: 3 } }}>
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

                  <Divider sx={{ my: { xs: 2, md: 3 } }} />

                  <Stack spacing={{ xs: 1.5, md: 2.5 }} sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <School sx={{ color: mutedZinc, fontSize: { xs: '1.1rem', md: '1.25rem' } }} />
                      <Box>
                        <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block">EDUCATION</Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                          {alumniData.dept} • {alumniData.batch}
                        </Typography>
                      </Box>
                    </Box>
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
                        sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: deepZinc, color: deepZinc, '&:hover': { borderColor: primaryBrand, bgcolor: 'transparent' } }}
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
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Detailed Info */}
            <Grid item xs={12} md={7} lg={8}>
              <Stack spacing={{ xs: 2.5, md: 4 }}>
                {/* Mentorship Note */}
                <Paper elevation={0} sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: { xs: '16px', md: '24px' },
                  border: '1px solid rgba(228, 228, 231, 0.6)'
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <WorkHistory sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>Mentorship Note</Typography>
                  </Stack>
                  <Typography variant="body1" color="#4b5563" sx={{ lineHeight: 1.8, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                    {alumniData.summary}
                  </Typography>
                </Paper>

                {/* Education */}
                <Paper elevation={0} sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: { xs: '16px', md: '24px' },
                  border: '1px solid rgba(228, 228, 231, 0.6)'
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                    <School sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>Education</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {alumniData.education.map((edu, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#f1f1f4', borderRadius: '12px', display: 'flex', alignItems: 'center', height: 'fit-content' }}>
                          <School sx={{ color: primaryBrand, fontSize: '1.3rem' }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{edu.degree}</Typography>
                          <Typography variant="body2" color={mutedZinc} sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>{edu.school}</Typography>
                          <Typography variant="caption" color={mutedZinc} fontWeight="600">Batch Year: {edu.year}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                {/* Mentoring Services */}
                <Paper elevation={0} sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: { xs: '16px', md: '24px' },
                  border: '1px solid rgba(228, 228, 231, 0.6)'
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                    <Handshake sx={{ color: deepZinc }} />
                    <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>Mentoring Services</Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {alumniData.mentoringTypes.map(type => (
                      <Box
                        key={type.id || type}
                        sx={{
                          p: '12px 20px',
                          bgcolor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid rgba(228, 228, 231, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }}
                      >
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: primaryBrand }} />
                        <Typography variant="body2" fontWeight="700">{type.name || type}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
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