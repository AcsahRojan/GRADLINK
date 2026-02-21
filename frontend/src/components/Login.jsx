import React, { useState, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Link,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircleOutlined,
  LockOutlined,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Professional Palette matching Register page
  const brandPrimary = '#6366f1'; // Modern Blue
  const brandDark = '#09090b'; // Slate 800
  const brandBg = '#f8fafc'; //slate 500
  const red = '#dc2626'; // Red 600

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        formData,
        { withCredentials: true } // set this if your backend requires cookies
      );

      const user = res.data.user;
      const token = res.data.token;

      // store user with token
      localStorage.setItem("user", JSON.stringify({ ...user, token }));

      //  ROLE BASED REDIRECT
      if (user.role === 'student') {
        navigate('/studenthome', { replace: true });
      } else if (user.role === 'alumni') {
        navigate('/alumnihome', { replace: true });
      }
      setMessage("Login successful ✅");

      // later → redirect based on role
    } catch (err) {
      setError("Invalid username or password");
    }
  };


  //spotlight
  function usePrefersReducedMotion() {
    return useMemo(() => {
      if (typeof window === "undefined") return true;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
  }
  const sidebarRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: brandBg }}>

      {/* LEFT SIDE: Brand Narrative (Fixed Sidebar) */}
      <Box
        ref={sidebarRef}
        onPointerMove={(e) => {
          if (reducedMotion) return;
          const el = sidebarRef.current;
          if (!el) return;

          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          el.style.setProperty("--spot-x", `${x}%`);
          el.style.setProperty("--spot-y", `${y}%`);
        }}
        sx={{
          width: { md: '350px', lg: '450px' },
          color: 'white',
          p: 6,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,

          /* SPOTLIGHT BACKGROUND */
          background: `
      radial-gradient(
        800px circle at var(--spot-x, 50%) var(--spot-y, 50%),
        rgba(99, 101, 241, 0.24),
        transparent 50%
      ),
      ${brandDark}
    `,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ mb: 4, letterSpacing: -0.5 }}>
            GRAD<span style={{ color: brandPrimary }}>LINK</span>
          </Typography>

          <Box sx={{ mt: 10 }}>
            <Typography variant="h3" fontWeight="700" lineHeight={1.2} gutterBottom>
              Welcome back to the <span style={{ color: brandPrimary }}>community</span>.
            </Typography>

            <Typography
              variant="body1"
              sx={{ mt: 3, opacity: 0.7, fontSize: '1.1rem' }}
            >
              Sign in to access your dashboard, connect with peers, and stay updated with your network.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
            "Networking is not just about connecting people. It's about connecting people with ideas and opportunities."
          </Typography>
        </Box>
      </Box>


      {/* RIGHT SIDE: Login Form Area */}
      <Box
        sx={{
          flexGrow: 1,
          ml: { md: '350px', lg: '450px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',

        }}
      >


        <Container maxWidth="xs" sx={{ py: 4 }}>
          {/* Close Button added here */}
          <IconButton
            href="/"
            sx={{
              position: 'relative',
              left: 350,
              color: 'text.secondary',
              '&:hover': { color: red, bgcolor: 'transparent' }
            }}
          >
            <Close />
          </IconButton>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800" color={brandDark} gutterBottom>
                Sign In
              </Typography>
              <Typography color="text.secondary">
                Enter your credentials to access your account
              </Typography>
            </Box>


            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <TextField
                label="Username"
                name="username"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Link href="#" variant="body2" sx={{ color: brandPrimary, fontWeight: '600', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: brandDark,
                  mt: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: brandPrimary },
                }}
              >
                Login
              </Button>
            </Paper>

            {message && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                <Typography color="#166534" fontWeight="600">{message}</Typography>
              </Box>
            )}

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/register" underline="none" sx={{ color: brandPrimary, fontWeight: '700', '&:hover': { textDecoration: 'underline' } }}>
                  Create an Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box >
  );
};

export default Login;