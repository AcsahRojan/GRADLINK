import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Stack,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Link,
  TextField,
  IconButton
} from '@mui/material';
import {
  Handshake,
  VerifiedUser,
  AutoGraph,
  LibraryBooks,
  Explore,
  Search,
  School,
  Public,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";


const usePrefersReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handler = (event) => setReducedMotion(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);
  return reducedMotion;
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollPos > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = 'rgba(228, 228, 231, 0.6)';

  const handleHeroSpotlight = (e) => {
    if (reducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty("--mouse-x", `${x}%`);
    heroRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  const navLinks = [
    { name: 'About Us', id: 'about' },
    { name: 'Why GradNexus', id: 'why' },
    { name: 'How it Works', id: 'how' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <Box sx={{ margin: 0, padding: 0, minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* --- NAVIGATION --- */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? `1px solid ${glassBorder}` : 'none',
          transition: 'all 0.3s ease',
          zIndex: 1200,
          fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
            <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: scrolled ? deepZinc : 'white', letterSpacing: '-1px', cursor: 'pointer' }}>

              {/* SVG logo */}
              <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" >
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
              <span>GRAD<span style={{ color: primaryBrand }}>NEXUS</span></span>

            </Typography>

            {!isMobile && (
              <Stack direction="row" spacing={3}>
                {navLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    underline="none"
                    sx={{
                      color: scrolled ? mutedZinc : 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      '&:hover': { color: scrolled ? deepZinc : 'white' }
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={1.5}>
              <Button
                sx={{
                  color: scrolled ? deepZinc : 'white',
                  fontWeight: 600, textTransform: 'none'
                }}
                onClick={() => navigate("/login")} >
                Login
              </Button>
              <Button variant="contained"
                sx={{
                  bgcolor: primaryBrand,
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3, fontWeight: 600,
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
                onClick={() => navigate("/register")}>
                Join Network
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 🌟 HERO SECTION --- */}
      <Box
        ref={heroRef}
        onPointerMove={handleHeroSpotlight}
        sx={{
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          pt: { xs: 15, md: 20 },
          pb: { xs: 10, md: 20 },
          position: 'relative',
          color: 'white',
          background: `
            radial-gradient(
              800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(99, 101, 241, 0.24),
              transparent 80%
            ),
            ${deepZinc}
          `,
          transition: 'background 0.1s ease-out'
        }}
      >
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(${primaryBrand} 0.5px, transparent 0.5px)`,
          backgroundSize: '30px 30px'
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <Chip
                label="Empowering Future Leaders"
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  fontWeight: 600,
                  color: primaryBrand,
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              />
              <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '3.5rem', md: '5rem' }, lineHeight: 1, mb: 3, letterSpacing: '-0.05em' }}>
                Your network is your <br />
                <span style={{ color: primaryBrand }}>ultimate edge.</span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, maxWidth: 600, fontWeight: 300, lineHeight: 1.6 }}>
                Connect with mentors who have walked your path or give back to the next generation of leaders.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button href="/register" variant="contained" size="large" sx={{ bgcolor: 'white', color: deepZinc, py: 2, px: 4, borderRadius: '12px', fontWeight: 700 }}>
                  Get Started
                </Button>
               
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- ABOUT US --- */}
      <Box id="about" sx={{ py: 15 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">

            <Grid item xs={12} md={6}>
              <Typography variant="overline" color={primaryBrand} fontWeight="800" letterSpacing={2}>ABOUT US</Typography>
              <Typography variant="h3" fontWeight="800" sx={{ mb: 3, mt: 1, letterSpacing: '-1.5px' }}>Democratizing access to high-level mentorship.</Typography>
              <Typography variant="h6" fontWeight="800" color={primaryBrand}>Founded by Alumni</Typography>
              <Typography variant="body2" color={mutedZinc} sx={{ mb: 4, lineHeight: 1.8 }}>For the next generation of global talent.</Typography>
              <Typography variant="body1" color={mutedZinc} sx={{ mb: 4, lineHeight: 1.8 }}>
                GradNexus was born out of a simple observation: the most successful careers aren't just built on hard work, but on the right connections and insider knowledge. We started as a small circle of alumni from top-tier universities helping juniors, and evolved into a global ecosystem.
              </Typography>
              <Stack spacing={2}>
                {['Global Reach: Connect with mentors in 50+ countries.', 'Quality First: Rigorous vetting for every mentor profile.', 'Impact Driven: 15,000+ successful career transitions.'].map((text, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: primaryBrand }} />
                    <Typography variant="body2" fontWeight="600">{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- WHY CHOOSE GRADNEXUS --- */}
      <Box id="why" sx={{ py: 15, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" color={primaryBrand} fontWeight="800" letterSpacing={2}>WHY CHOOSE US</Typography>
            <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-1.5px', mt: 1 }}>Why the best talent chooses GradNexus.</Typography>
          </Box>
          <Grid container spacing={4} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', justifyContent: 'center' }}>
            {[
              { title: 'Direct Referrals', icon: <Handshake />, desc: 'Skip the standard application process. Our mentors refer qualified candidates directly to hiring managers.' },
              { title: 'Verified Profiles', icon: <VerifiedUser />, desc: 'Every mentor is verified via LinkedIn and work email to ensure you are talking to real professionals.' },
              { title: 'Industry Insights', icon: <AutoGraph />, desc: 'Get the "unwritten rules" of your industry that you wont find in any textbook or online course.' }
            ].map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: '28px', height: '100%', border: `1px solid ${glassBorder}`, bgcolor: 'white' }}>
                  <Box sx={{ color: primaryBrand, mb: 3 }}>{React.cloneElement(f.icon, { sx: { fontSize: 40 } })}</Box>
                  <Typography variant="h5" fontWeight="800" gutterBottom>{f.title}</Typography>
                  <Typography variant="body1" color={mutedZinc} sx={{ lineHeight: 1.7 }}>{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* --- HOW IT WORKS --- */}
      <Box id="how" sx={{ py: 15 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 10 }}>
            <Typography variant="overline" color={primaryBrand} fontWeight="800" letterSpacing={2}>HOW IT WORKS</Typography>
            <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-1.5px', mt: 1 }}>Three steps to your next big break.</Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Find your match', desc: 'Browse our directory by industry, company, or alma mater to find the perfect mentor.' },
              { step: '02', title: 'Connect & Learn', desc: 'Book a session or send a message to start receiving personalized career guidance.' },
              { step: '03', title: 'Level up', desc: 'Get the referrals, resume reviews, and interview prep you need to land your dream role.' }
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h1" fontWeight="900" sx={{ color: '#d1d1d4ff', ml: -2 }}>{s.step}</Typography>
                  <Typography variant="h5" fontWeight="800" gutterBottom sx={{ position: 'relative' }}>{s.title}</Typography>
                  <Typography variant="body1" color={mutedZinc}>{s.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* --- CONTACT US & FEEDBACK --- */}
      <Box id="contact" sx={{ py: 15, bgcolor: deepZinc, color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={10}>
            <Grid item xs={12} md={5}>
              <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-1.5px' }}>Let's talk.</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6 }}>
                Have questions or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
              </Typography>
              <Stack spacing={4}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Email sx={{ color: primaryBrand }} />
                  <Typography variant="body1">hello@gradnexus.com</Typography>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Phone sx={{ color: primaryBrand }} />
                  <Typography variant="body1">+1 (555) 000-1234</Typography>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                  <LocationOn sx={{ color: primaryBrand }} />
                  <Typography variant="body1">San Francisco, CA</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box sx={{ py: 10, borderTop: `1px solid ${glassBorder}`, bgcolor: '#d1d1d1ff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: '-1px', mb: 3 }}>
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
                <span>GRAD<span style={{ color: primaryBrand }}>NEXUS</span></span>
              </Typography>
              <Typography variant="body2" color={mutedZinc} sx={{ lineHeight: 1.8, mb: 4 }}>
                Building the global bridge between academic potential and professional reality. Join thousands of successful alumni today.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, i) => (
                  <IconButton key={i} sx={{ border: `1px solid ${mutedZinc}`, color: deepZinc, '&:hover': { color: primaryBrand, borderColor: primaryBrand } }}>
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography fontWeight="800" sx={{ mb: 3, fontSize: '0.9rem' }}>Platform</Typography>
              <Stack spacing={2}>
                {['Mentors', 'Referrals', 'Career Maps', 'Pricing'].map(l => <Link key={l} href="#" underline="none" color={mutedZinc} sx={{ fontSize: '0.85rem' }}>{l}</Link>)}
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography fontWeight="800" sx={{ mb: 3, fontSize: '0.9rem' }}>Company</Typography>
              <Stack spacing={2}>
                {['About Us', 'Careers', 'Blog', 'Contact'].map(l => <Link key={l} href="#" underline="none" color={mutedZinc} sx={{ fontSize: '0.85rem' }}>{l}</Link>)}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography fontWeight="800" sx={{ mb: 3, fontSize: '0.9rem' }}>Stay Updated</Typography>
              <Typography variant="body2" color={mutedZinc} sx={{ mb: 3 }}>Get the latest industry insights and network updates.</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" placeholder="Email address" sx={{ flex: 1 }} />
                <Button variant="contained" sx={{ bgcolor: deepZinc }}>
                  <ArrowForward />
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 10, pt: 4, borderTop: `1px solid ${mutedZinc}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color={mutedZinc}>© 2026 GradNexus Inc. All rights reserved.</Typography>
            <Stack direction="row" spacing={3}>
              <Link href="#" variant="caption" color={mutedZinc} underline="none">Privacy Policy</Link>
              <Link href="#" variant="caption" color={mutedZinc} underline="none">Terms of Service</Link>
              <Link href="#" variant="caption" color={mutedZinc} underline="none">Cookie Settings</Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;