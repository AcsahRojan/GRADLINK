import React, { useState, useMemo, useEffect } from 'react';
import {Container,Box,Grid,Typography,Stack,Paper,
Avatar,Button,Chip,IconButton,Divider,TextField,
InputAdornment,MenuItem,FormControlLabel,Switch,Card,
Tooltip,Drawer,useMediaQuery,useTheme
} from '@mui/material';
import {
  Search,
  FilterList,
  Verified,
  Business,
  History,
  Psychology,
  Handshake,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SNavbar from './SNavbar';
import { getAlumni } from '../api';

const FindAlumni = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
 

  // --- UI Constants ---
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMentors, setOnlyMentors] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    course: 'All',
    batch: 'All',
    industry: 'All'
  });
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const data = await getAlumni();
        // Add initials to each alumni
        const processedData = data.map(alum => ({
          ...alum,
          initials: alum.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }));
        setAlumniList(processedData);
      } catch (error) {
        console.error("Failed to fetch alumni", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  // --- Filter Logic ---
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(person => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMentorship = onlyMentors ? person.mentorship : true;
      const matchesCourse = filters.course === 'All' ? true : person.dept === filters.course;
      const matchesBatch = filters.batch === 'All' ? true : person.batch === filters.batch;

      return matchesSearch && matchesMentorship && matchesCourse && matchesBatch;
    });
  }, [searchQuery, onlyMentors, filters, alumniList]);

  // Filter Panel Component
  const FilterPanel = () => (
    <Paper elevation={0} sx={{
      p: { xs: 3, sm: 3.5, md: 4 },
      borderRadius: '24px',
      border: `1px solid ${glassBorder}`,
      position: { xs: 'relative', lg: 'sticky' },
      top: { lg: 100 },
      bgcolor: '#fff'
    }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '0.8rem', md: '0.875rem' }
            }}
          >
            <FilterList fontSize="small" /> SEARCH FILTERS
          </Typography>
          <TextField
            fullWidth
            placeholder="Name, role, or skill..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: mutedZinc, fontSize: { xs: 18, md: 20 } }} /></InputAdornment>,
              sx: {
                borderRadius: '12px',
                bgcolor: '#f9fafb',
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }
            }}
          />
        </Box>

        <Divider />

        {/* Mentorship Toggle */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={onlyMentors}
                onChange={(e) => setOnlyMentors(e.target.checked)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: primaryBrand },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: primaryBrand },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                fontWeight="700"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                Only Mentors Available
              </Typography>
            }
          />
        </Box>

        {/* Dropdown Filters */}
        <Stack spacing={{ xs: 1.5, md: 2.5 }}>
          <Box>
            <Typography
              variant="caption"
              fontWeight="800"
              color={mutedZinc}
              sx={{ mb: 1, display: 'block', fontSize: { xs: '0.7rem', md: '0.75rem' } }}
            >
              DEPARTMENT
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={filters.course}
              onChange={(e) => setFilters({ ...filters, course: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }
              }}
            >
              <MenuItem value="All">All Departments</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
              <MenuItem value="Business Administration">Business Admin</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
            </TextField>
          </Box>

          <Box>
            <Typography
              variant="caption"
              fontWeight="800"
              color={mutedZinc}
              sx={{ mb: 1, display: 'block', fontSize: { xs: '0.7rem', md: '0.75rem' } }}
            >
              BATCH YEAR
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }
              }}
            >
              <MenuItem value="All">Any Batch</MenuItem>
              <MenuItem value="2021">2021</MenuItem>
              <MenuItem value="2020">2020</MenuItem>
              <MenuItem value="2019">2019</MenuItem>
              <MenuItem value="2018">2018</MenuItem>
            </TextField>
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => { setSearchQuery(''); setOnlyMentors(false); setFilters({ course: 'All', batch: 'All', industry: 'All' }) }}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            color: deepZinc,
            borderColor: glassBorder,
            fontSize: { xs: '0.8rem', md: '0.9rem' },
            py: { xs: 0.75, md: 1 }
          }}
        >
          Reset Filters
        </Button>
      </Stack>
    </Paper>
  );

  return (
    <>
      <SNavbar />
      <Box sx={{ bgcolor: '#ffffff', minHeight: '80vh', pb: { xs: 6, sm: 8, md: 10 } }}>

        <Box sx={{ height: { xs: 60, sm: 60, md: 60 } }} />

        {/* Main Container - Responsive */}
        <Container
          sx={{
            width: {
              xs: '100%',
              sm: '100%',
              md: '100%',
              lg: '1280px',
              xl: '1280px'
            },
            maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: 'none' },
            px: { xs: 2, sm: 3, md: 4, lg: 0 },
            pt: { xs: 3, sm: 4 }
          }}
        >

          {/* Header Section */}
          <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                color: deepZinc,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' }
              }}
            >
              Find & Connect with Alumni
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: mutedZinc,
                mt: 1,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Reach out to graduates for career advice, mentorship, or networking opportunities.
            </Typography>
          </Box>

          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{ flexDirection: { xs: 'column', lg: 'row' } }}
          >

            {/* LEFT COLUMN: Filters (Responsive Width) */}
            <Grid
              item
              xs={12}
              sm={12}
              md={5}
              lg={3}
              sx={{
                width: { xs: '100%', md: 'auto' },
                display: { xs: 'none', lg: 'block' }
              }}
            >
              <FilterPanel />
            </Grid>

            {/* Mobile Filter Button */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, width: '100%', mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setMobileFilterOpen(true)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  color: deepZinc,
                  borderColor: glassBorder,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  py: 1
                }}
              >
                Open Filters
              </Button>
            </Box>

            {/* Mobile Filter Drawer */}
            <Drawer
              anchor="right"
              open={mobileFilterOpen}
              onClose={() => setMobileFilterOpen(false)}
              sx={{
                display: { xs: 'block', lg: 'none' },
                '& .MuiDrawer-paper': {
                  width: '100%',
                  maxWidth: 320,
                  pt: 2
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="800">Filters</Typography>
                  <IconButton onClick={() => setMobileFilterOpen(false)} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
                <FilterPanel />
              </Box>
            </Drawer>

            {/* RIGHT COLUMN: Alumni Grid (Responsive) */}
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              lg={9}
              sx={{
                width: { xs: '100%', md: 'auto' },
                maxWidth: { xs: '100%', md: '920px' }
              }}
            >
              <Box
                sx={{
                  mb: { xs: 2, md: 3 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="700"
                  color={mutedZinc}
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Showing {filteredAlumni.length} results
                </Typography>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)' }}>
                {filteredAlumni.map((alumni) => (
                  <Grid item xs={12} key={alumni.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, sm: 2.5, md: 3 },
                        borderRadius: '20px',
                        border: `1px solid ${glassBorder}`,
                        transition: '0.3s',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                          borderColor: primaryBrand
                        },
                        bgcolor: '#fff'
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 2, sm: 2.5, md: 3 }}
                        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                      >
                        {/* Left: Photo & Badge */}
                        <Box sx={{ position: 'relative'}}>
                          <Avatar
                            src={alumni.image ? (alumni.image.startsWith('http') ? alumni.image : `http://localhost:8000${alumni.image}`) : ''}
                            sx={{
                              width: { xs: 70, sm: 75, md: 80 },
                              height: { xs: 70, sm: 75, md: 80 },
                              bgcolor: '#f1f1f4',
                              color: deepZinc,
                              fontWeight: 800,
                              fontSize: { xs: '1.2rem', md: '1.5rem' },
                              border: `2px solid ${glassBorder}`
                            }}
                          >
                            {!alumni.image && alumni.initials}
                          </Avatar>
                          {alumni.mentorship && (
                            <Tooltip title="Verified Mentor">
                              <Box sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                bgcolor: primaryBrand,
                                color: 'white',
                                borderRadius: '50%',
                                p: 0.5,
                                display: 'flex',
                                border: '3px solid white'
                              }}>
                                <Handshake sx={{ fontSize: { xs: 12, md: 14 } }} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>

                        {/* Middle: Content */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={{ xs: 0.5, sm: 1 }}
                            sx={{ mb: { xs: 1, md: 0.5 }, flexWrap: 'wrap' }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="800"
                              sx={{
                                lineHeight: 1,
                                fontSize: { xs: '1rem', md: '1.1rem' }
                              }}
                            >
                              {alumni.name}
                            </Typography>
                            <Verified sx={{ color: primaryBrand, fontSize: { xs: 16, md: 18 } }} />
                            {alumni.mentorship && (
                              <Chip
                                label="Mentorship Available"
                                size="small"
                                sx={{
                                  height: { xs: 18, md: 20 },
                                  fontSize: { xs: '0.6rem', md: '0.65rem' },
                                  fontWeight: 800,
                                  bgcolor: `${primaryBrand}15`,
                                  color: primaryBrand,
                                  border: `1px solid ${primaryBrand}30`
                                }}
                              />
                            )}
                          </Stack>

                          <Stack spacing={{ xs: 0.75, md: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Business sx={{ color: mutedZinc, fontSize: { xs: 14, md: 16 }, flexShrink: 0 }} />
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                              >
                                {alumni.role} <span style={{ color: mutedZinc, fontWeight: 500 }}>at</span> {alumni.company}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <History sx={{ color: mutedZinc, fontSize: { xs: 14, md: 16 }, flexShrink: 0 }} />
                              <Typography
                                variant="body2"
                                color={mutedZinc}
                                sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                              >
                                {alumni.dept} • Class of {alumni.batch}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={{ xs: 0.75, md: 1 }}
                            sx={{ mt: { xs: 1.5, md: 2 }, flexWrap: 'wrap', gap: 0.75 }}
                          >
                            {alumni.skills.map(skill => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                sx={{
                                  fontSize: { xs: '0.65rem', md: '0.75rem' },
                                  fontWeight: 600,
                                  bgcolor: '#f4f4f5',
                                  height: 'fit-content'
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        {/* Right: Actions */}
                        <Stack
                          spacing={{ xs: 1, sm: 1.5 }}
                          sx={{
                            minWidth: { xs: '100%', sm: 160 },
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          <Button
                            onClick={() => navigate(`/alumniprofile/${alumni.id}`)}
                            variant="contained"
                            disableElevation
                            fullWidth={isMobile || isTablet}
                            sx={{
                              bgcolor: deepZinc,
                              borderRadius: '10px',
                              textTransform: 'none',
                              
                              fontWeight: 700,
                              fontSize: { xs: '0.8rem', md: '0.875rem' },
                              py: { xs: 0.75, md: 1 },
                              '&:hover': { bgcolor: '#000' }
                            }}
                          >
                            View Profile
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}

                {filteredAlumni.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
                      <Psychology sx={{ fontSize: { xs: 40, md: 60 }, color: '#e4e4e7', mb: 2 }} />
                      <Typography
                        variant="h6"
                        fontWeight="800"
                        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                      >
                        No alumni found
                      </Typography>
                      <Typography
                        variant="body2"
                        color={mutedZinc}
                        sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                      >
                        Try adjusting your filters or search keywords.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default FindAlumni;