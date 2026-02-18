import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Tab,
  Tabs,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn,
  AccessTime,
  Add,
  CheckCircle,
  Search,
  CalendarMonth,
  VideoCameraFront,
  Groups,
  InfoOutlined,
  Close,
  Delete,
  Edit,
  People
} from '@mui/icons-material';
import SNavbar from './SNavbar';
import ANavbar from './ANavbar';
import { getEvents, createEvent, registerEvent, deleteEvent, updateEvent } from '../api';

const Events = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the "View Details" modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  // Styling Constants
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  // Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'online',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };


  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      // Transform data if necessary to match UI expectations
      // Backend returns: id, title, description, date, time, location, type, organizer, organizer_name, is_registered
      const transformedData = data.map(ev => ({
        ...ev,
        organizer: ev.organizer_name, // Use name for display
        registered: ev.is_registered,
        participantsCount: ev.participants_count,
        participants: ev.participants
      }));
      setEvents(transformedData);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Auth parsing error", e);
    }
    fetchEvents();
  }, []);

  const handleRegister = async (id) => {
    try {
      const result = await registerEvent(id);
      const isRegistered = result.status === 'registered';

      setEvents(events.map(ev => ev.id === id ? { ...ev, registered: isRegistered } : ev));

      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(prev => ({ ...prev, registered: isRegistered }));
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        fetchEvents();
        if (selectedEvent && selectedEvent.id === eventId) {
          setOpenDetailsModal(false);
          setSelectedEvent(null);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setOpenDetailsModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      if (editingId) {
        await updateEvent(editingId, newEvent);
      } else {
        await createEvent(newEvent);
      }
      setOpenCreateModal(false);
      setNewEvent({ title: '', date: '', time: '', location: '', type: 'online', description: '' });
      setEditingId(null);
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error("Failed to save event", error);
    }
  };

  const handleEditEvent = (event) => {
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      description: event.description
    });
    setEditingId(event.id);
    setOpenCreateModal(true);
  };

  const isAlumni = user?.role === 'alumni';

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayEvents = activeTab === 0
    ? filteredEvents
    : isAlumni
      ? filteredEvents.filter(ev => ev.organizer === user.username) // Assuming username check
      : filteredEvents.filter(ev => ev.registered);

  if (!user) return null;

  return (
    <>
      {user && user.role === "student" ? <SNavbar /> : <ANavbar />}
      <Box sx={{ bgcolor: '#fcfcfd', minHeight: '100vh', pb: 10 }}>
        <Box sx={{ height: { xs: 70, md: 90 } }} />

        <Container
          sx={{
            width: { xs: '100%', lg: '1280px' },
            maxWidth: { lg: 'none' },
            px: { xs: 2, sm: 3, md: 4, lg: 0 }
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
            <Box>
              <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                Events
              </Typography>
              <Typography variant="body1" color={mutedZinc} fontWeight="500">
                {isAlumni ? "Create and manage events for your community" : "Discover workshops, seminars, and networking sessions"}
              </Typography>
            </Box>

            {isAlumni && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingId(null);
                  setNewEvent({ title: '', date: '', time: '', location: '', type: 'online', description: '' });
                  setOpenCreateModal(true);
                }}
                sx={{
                  bgcolor: deepZinc,
                  color: 'white',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#18181b' }
                }}
              >
                Host an Event
              </Button>
            )}
          </Box>

          {/* Search and Tabs */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ borderBottom: 1, borderColor: glassBorder, bgcolor: 'transparent' }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                  <Tab label="Explore All" sx={{ textTransform: 'none', fontWeight: 700, px: 3 }} />
                  <Tab label={isAlumni ? "Hosted by Me" : "My Registrations"} sx={{ textTransform: 'none', fontWeight: 700, px: 3 }} />
                </Tabs>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: mutedZinc }} />,
                  sx: { borderRadius: '14px', bgcolor: 'white' }
                }}
              />
            </Grid>
          </Grid>

          {/* Event List */}
          <Stack spacing={3}>
            {loading ? (
              <Typography>Loading events...</Typography>
            ) : displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <Paper
                  key={event.id}
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '24px',
                    border: `1px solid ${glassBorder}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                        <Chip
                          icon={event.type === 'online' ? <VideoCameraFront sx={{ fontSize: '16px !important' }} /> : <Groups sx={{ fontSize: '16px !important' }} />}
                          label={event.type === 'online' ? 'Online' : 'In-Person'}
                          sx={{ fontWeight: 700, bgcolor: event.type === 'online' ? '#eff6ff' : '#f0fdf4', color: event.type === 'online' ? '#1d4ed8' : '#15803d' }}
                        />
                        <Chip
                          label={event.organizer}
                          variant="outlined"
                          sx={{ fontWeight: 600, color: mutedZinc, borderColor: glassBorder }}
                        />
                      </Stack>

                      <Typography variant="h5" fontWeight="800" gutterBottom>
                        {event.title}
                      </Typography>

                      <Typography variant="body1" color="#4b5563" sx={{ mb: 3, maxWidth: '600px' }}>
                        {event.description.substring(0, 120)}...
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: mutedZinc }}>
                            <CalendarMonth fontSize="small" />
                            <Typography variant="body2" fontWeight="600">{formatDate(event.date)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: mutedZinc }}>
                            <AccessTime fontSize="small" />
                            <Typography variant="body2" fontWeight="600">{formatTime(event.time)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: mutedZinc }}>
                            <LocationOn fontSize="small" />
                            <Typography variant="body2" fontWeight="600">{event.location}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      {!isAlumni ? (
                        <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewDetails(event)}
                            startIcon={<InfoOutlined />}
                            sx={{
                              borderRadius: '12px',
                              px: 3,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              borderColor: glassBorder,
                              color: deepZinc
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant={event.registered ? "outlined" : "contained"}
                            onClick={() => handleRegister(event.id)}
                            startIcon={event.registered ? <CheckCircle /> : <EventIcon />}
                            sx={{
                              borderRadius: '12px',
                              px: 3,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              bgcolor: event.registered ? 'transparent' : primaryBrand,
                              borderColor: event.registered ? '#10b981' : 'transparent',
                              color: event.registered ? '#10b981' : 'white',
                              '&:hover': { bgcolor: event.registered ? 'rgba(16, 185, 129, 0.05)' : '#4f46e5' }
                            }}
                          >
                            {event.registered ? "Registered" : "Register"}
                          </Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewDetails(event)}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', borderColor: glassBorder, color: deepZinc }}
                          >
                            View
                          </Button>
                          {user.username === event.organizer && (
                            <>
                              <IconButton
                                onClick={() => handleEditEvent(event)}
                                sx={{
                                  color: 'primary.main',
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  borderRadius: '10px'
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteEvent(event.id)}
                                sx={{
                                  color: 'error.main',
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  borderRadius: '10px'
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}

                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: '24px', border: `1px dashed ${mutedZinc}` }}>
                <Typography variant="h6" fontWeight="700" color={mutedZinc}>No events found</Typography>
              </Paper>
            )}
          </Stack>
        </Container>

        {/* Student View Details Modal */}
        <Dialog
          open={openDetailsModal}
          onClose={() => setOpenDetailsModal(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
        >
          {selectedEvent && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3 }}>
                <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.01em' }}>
                  Event Details
                </Typography>
                <IconButton onClick={() => setOpenDetailsModal(false)}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <Box>
                    <Chip
                      label={selectedEvent.organizer}
                      variant="outlined"
                      sx={{ fontWeight: 700, color: primaryBrand, borderColor: primaryBrand, mb: 2 }}
                    />
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                      {selectedEvent.title}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: glassBorder }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, bgcolor: '#f4f4f5', borderRadius: '12px' }}>
                          <CalendarMonth sx={{ color: deepZinc }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color={mutedZinc} fontWeight="700">DATE</Typography>
                          <Typography variant="body1" fontWeight="700">{formatDate(selectedEvent.date)}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, bgcolor: '#f4f4f5', borderRadius: '12px' }}>
                          <AccessTime sx={{ color: deepZinc }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color={mutedZinc} fontWeight="700">TIME</Typography>
                          <Typography variant="body1" fontWeight="700">{formatTime(selectedEvent.time)}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, bgcolor: '#f4f4f5', borderRadius: '12px' }}>
                          <LocationOn sx={{ color: deepZinc }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color={mutedZinc} fontWeight="700">LOCATION</Typography>
                          <Typography variant="body1" fontWeight="700">{selectedEvent.location}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: '20px' }}>
                    <Typography variant="subtitle2" fontWeight="800" color={deepZinc} gutterBottom sx={{ mb: 1.5 }}>
                      ABOUT THIS EVENT
                    </Typography>
                    <Typography variant="body1" color="#475569" sx={{ lineHeight: 1.7 }}>
                      {selectedEvent.description}
                    </Typography>
                  </Box>

                  {/* Participants Section */}
                  <Box sx={{ bgcolor: '#f0fdfa', p: 3, borderRadius: '20px', border: '1px dashed #14b8a6' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <People sx={{ color: '#0d9488' }} />
                      <Typography variant="subtitle1" fontWeight="800" color="#0f766e">
                        Participants ({selectedEvent.participantsCount})
                      </Typography>
                    </Stack>

                    {user.username === selectedEvent.organizer && selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                      <Stack spacing={1.5}>
                        {selectedEvent.participants.map((p) => (
                          <Paper key={p.id} elevation={0} sx={{ p: 1.5, bgcolor: 'white', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
                            <Typography variant="subtitle2" fontWeight="700" color="#0f766e">
                              {p.first_name} {p.last_name}
                            </Typography>
                            <Typography variant="caption" color="#115e59">
                              {p.email}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    ) : user.username === selectedEvent.organizer ? (
                      <Typography variant="body2" color="#115e59">No participants registered yet.</Typography>
                    ) : null}
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                {!isAlumni && (
                  <Button
                    fullWidth
                    variant={selectedEvent.registered ? "outlined" : "contained"}
                    onClick={() => handleRegister(selectedEvent.id)}
                    sx={{
                      py: 2,
                      borderRadius: '14px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: selectedEvent.registered ? 'transparent' : deepZinc,
                      color: selectedEvent.registered ? '#10b981' : 'white',
                      borderColor: selectedEvent.registered ? '#10b981' : 'transparent',
                      fontSize: '1rem',
                      '&:hover': { bgcolor: selectedEvent.registered ? 'rgba(16, 185, 129, 0.05)' : '#18181b' }
                    }}
                  >
                    {selectedEvent.registered ? "Successfully Registered" : "Confirm Registration"}
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>


        {/* Create Event Dialog for Alumni */}
        <Dialog
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          PaperProps={{ sx: { borderRadius: '24px', p: 2, width: '100%', maxWidth: '500px' } }}
        >

          <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>{editingId ? "Update Event" : "Host New Event"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Event Title"
                placeholder="e.g. Masterclass in Web3"
                variant="outlined"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </Grid>
              </Grid>
              <TextField
                select
                fullWidth
                label="Type"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Location"
                placeholder="Online URL or Venue Address"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                placeholder="What will attendees learn?"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => { setOpenCreateModal(false); setEditingId(null); }} sx={{ fontWeight: 700, color: mutedZinc }}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: deepZinc, fontWeight: 700, px: 3, borderRadius: '10px' }}
              onClick={handleSaveEvent}
            >
              {editingId ? "Update Event" : "Create Event"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Events;