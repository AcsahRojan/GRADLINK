import React, { useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Button,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard,
  Explore,
  Event,
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowDown,
  Assignment,
  People,
  Work,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

const SNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mentorshipAnchorEl, setMentorshipAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const open = Boolean(anchorEl);
  const mentorshipOpen = Boolean(mentorshipAnchorEl);

  const handleOpenUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  const handleOpenMentorshipMenu = (event) => setMentorshipAnchorEl(event.currentTarget);
  const handleCloseMentorshipMenu = () => setMentorshipAnchorEl(null);

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  // Logout handler — clears local storage and redirects to login
  const handleLogout = () => {
    localStorage.removeItem("user");
    handleCloseUserMenu();
    handleMobileMenuClose();
    navigate('/login', { replace: true });
  };

  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  const navLinks = [
    { name: 'Dashboard', icon: <Dashboard fontSize="small" />, id: 'dashboard', path: '/studenthome' },
    { name: 'Find Alumni', icon: <Explore fontSize="small" />, id: 'find-alumni', path: '/findalumni' },
    {
      name: 'Mentorship', icon: <People fontSize="small" />, id: 'mentorship', isDropdown: true,
      subLinks: [
        { name: 'Requests', path: '/mentorshiprequests', icon: <Assignment fontSize="small" /> },
        { name: 'My Mentors', path: '/mymentors', icon: <Person fontSize="small" /> },
      ]
    },
    { name: 'Career', icon: <Work fontSize="small" />, id: 'career', path: '/jobs' },
    { name: 'Events', icon: <Event fontSize="small" />, id: 'events', path: '/events' },
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${glassBorder}`,
          zIndex: 1300
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 1 }, minHeight: { xs: 56, sm: 64 } }}>
            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 3, md: 4 }}
              alignItems="center"
              sx={{ minWidth: 'fit-content' }}
            >
              <Typography
                variant="h6"
                fontWeight="800"
                onClick={() => navigate('/studenthome')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: deepZinc,
                  letterSpacing: '-1px',
                  cursor: 'pointer',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                {/* SVG logo */}
                <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#6366f1">
                    {/* --- Graduation Cap --- */}
                    <path d="M32 8L8 20L32 32L56 20L32 8Z" />
                    <path d="M32 32V44L20 38V26L32 32Z" />
                    <path d="M32 44L44 38V26L32 32V44Z" />
                    <circle cx="44" cy="20" r="2" />
                    <line x1="44" y1="20" x2="44" y2="28" stroke="#6366f1" stroke-width="2" />

                    {/* --- Chain Link --- */}
                    <path d="M20 48C20 44.6863 22.6863 42 26 42H30V46H26C24.8954 46 24 46.8954 24 48C24 49.1046 24.8954 50 26 50H30V54H26C22.6863 54 20 51.3137 20 48Z" />
                    <path d="M44 48C44 51.3137 41.3137 54 38 54H34V50H38C39.1046 50 40 49.1046 40 48C40 46.8954 39.1046 46 38 46H34V42H38C41.3137 42 44 44.6863 44 48Z" />
                    <rect x="30" y="46" width="4" height="4" rx="2" />
                  </g>
                </svg>
                {/* Text logo */}
                <span>GRAD<span style={{ color: primaryBrand }}>LINK</span></span>
              </Typography>

              <Stack
                direction="row"
                spacing={{ xs: 0.5, md: 1 }}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {navLinks.map((link) => (
                  link.isDropdown ? (
                    <Box key={link.id}>
                      <Button
                        onClick={handleOpenMentorshipMenu}
                        startIcon={link.icon}
                        endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                        sx={{
                          color: deepZinc,
                          fontWeight: 600,
                          px: { md: 1.5, lg: 2 },
                          py: { md: 0.75 },
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: { md: '0.9rem', lg: '0.95rem' },
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)', color: primaryBrand }
                        }}
                      >
                        {link.name}
                      </Button>
                      <Menu
                        anchorEl={mentorshipAnchorEl}
                        open={mentorshipOpen}
                        onClose={handleCloseMentorshipMenu}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.05))',
                            mt: 1,
                            borderRadius: '12px',
                            border: `1px solid ${glassBorder}`,
                            minWidth: 180,
                            '& .MuiMenuItem-root': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              mx: 1,
                              my: 0.5,
                              borderRadius: '8px'
                            }
                          }
                        }}
                      >
                        {link.subLinks.map((sub) => (
                          <MenuItem key={sub.path} onClick={() => { navigate(sub.path); handleCloseMentorshipMenu(); }}>
                            <ListItemIcon>{sub.icon}</ListItemIcon> {sub.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    <Button
                      key={link.id}
                      component={Link}
                      to={link.path}
                      startIcon={link.icon}
                      sx={{
                        color: deepZinc,
                        fontWeight: 600,
                        px: { md: 1.5, lg: 2 },
                        py: { md: 0.75 },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: { md: '0.9rem', lg: '0.95rem' },
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)', color: primaryBrand }
                      }}
                    >
                      {link.name}
                    </Button>
                  )
                ))}
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1, lg: 2 }}
              alignItems="center"
              sx={{ flex: 1, justifyContent: 'flex-end' }}
            >
              {/* <Box sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                bgcolor: '#f4f4f5',
                px: 2,
                py: 0.7,
                borderRadius: '12px',
                width: 300,
                border: '1px solid transparent',
                '&:focus-within': { border: `1px solid ${primaryBrand}`, bgcolor: '#fff' }
              }}>
                <Search sx={{ color: mutedZinc, mr: 1, fontSize: 20 }} />
                <InputBase
                  placeholder="Search alumni, skills..."
                  fullWidth
                  sx={{ fontSize: '0.85rem', fontWeight: 500 }}
                />
              </Box> */}

              <Stack direction="row" spacing={{ xs: 0.25, sm: 0.5, md: 1 }} alignItems="center">
                {/* <Tooltip title="Notifications">
                  <IconButton size="small" sx={{ p: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' } }}>
                    <Badge variant="dot" color="error">
                      <Notifications sx={{ color: mutedZinc, fontSize: { xs: 20, md: 24 } }} />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Messages">
                  <IconButton size="small" sx={{ p: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' } }}>
                    <ChatBubbleOutline sx={{ color: mutedZinc, fontSize: { xs: 20, md: 24 } }} />
                  </IconButton>
                </Tooltip> */}

                <Box sx={{ width: '1px', height: { xs: '20px', md: '24px' }, bgcolor: glassBorder, mx: { xs: 0.5, md: 1 }, display: { xs: 'none', sm: 'block' } }} />

                <Box
                  onClick={handleOpenUserMenu}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: { sm: 1, md: 1.5 },
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                  }}
                >
                  <Avatar
                    src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000${user.image}`) : ''}
                    sx={{ width: 34, height: 34, bgcolor: primaryBrand, fontSize: '0.85rem', fontWeight: 700, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${primaryBrand}30` }}
                  >
                    {!user.image && `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                  </Avatar>
                </Box>

                <Avatar
                  onClick={handleOpenUserMenu}
                  src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000${user.image}`) : ''}
                  sx={{ display: { xs: 'flex', sm: 'none' }, width: 32, height: 32, bgcolor: primaryBrand, fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {!user.image && `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                </Avatar>

                <IconButton size="small" onClick={handleMobileMenuToggle} sx={{ display: { xs: 'flex', md: 'none' }, p: 0.75 }}>
                  {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              </Stack>
            </Stack>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${glassBorder}`,
                  minWidth: 200,
                  '& .MuiMenuItem-root': { fontSize: '0.85rem', fontWeight: 500, borderRadius: '8px', mx: 1, my: 0.5 }
                },
              }}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate("/sprofile"); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon> My Profile
              </MenuItem>
              {/* <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon> Settings
              </MenuItem> */}
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: '100%', maxWidth: 280, pt: 10 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={0.5}>
            {navLinks.map((link) => (
              <Box key={link.id}>
                {!link.isDropdown ? (
                  <Button
                    component={Link}
                    to={link.path}
                    fullWidth
                    startIcon={link.icon}
                    onClick={handleMobileMenuClose}
                    sx={{
                      color: deepZinc,
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1.25,
                      borderRadius: '10px',
                      textTransform: 'none',
                    }}
                  >
                    {link.name}
                  </Button>
                ) : (
                  <Box sx={{ py: 1 }}>
                    <Typography variant="caption" sx={{ px: 2, fontWeight: 800, color: mutedZinc, mb: 1, display: 'block' }}>
                      MENTORSHIP
                    </Typography>
                    {link.subLinks.map((sub) => (
                      <Button
                        key={sub.path}
                        component={Link}
                        to={sub.path}
                        fullWidth
                        startIcon={sub.icon}
                        onClick={handleMobileMenuClose}
                        sx={{
                          color: deepZinc,
                          fontWeight: 600,
                          justifyContent: 'flex-start',
                          px: 3,
                          py: 1,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontSize: '0.9rem'
                        }}
                      >
                        {sub.name}
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ px: 1 }}>
            <Typography variant="caption" color={mutedZinc} sx={{ fontWeight: 600 }}>ACCOUNT</Typography>
            <Stack spacing={0.5} sx={{ mt: 1.5 }}>
              <Button fullWidth startIcon={<Person fontSize="small" />} onClick={() => { handleMobileMenuClose(); navigate("/sprofile"); }} sx={{ color: deepZinc, fontWeight: 600, justifyContent: 'flex-start', px: 2, py: 1, textTransform: 'none' }}>Profile</Button>
              <Button fullWidth startIcon={<Logout fontSize="small" />} onClick={() => { handleMobileMenuClose(); handleLogout(); }} sx={{ color: '#ef4444', fontWeight: 600, justifyContent: 'flex-start', px: 2, py: 1, textTransform: 'none' }}>Logout</Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default SNavbar;