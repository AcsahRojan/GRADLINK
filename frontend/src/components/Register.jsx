import React, { useState, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Container,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Paper,
  Select,
  Autocomplete,
} from '@mui/material';
import { KERALA_COLLEGES } from '../constants/colleges';
import { KERALA_DEGREES } from '../constants/degrees';
import {
  School,
  Work,
  Visibility,
  VisibilityOff,
  EmailOutlined,
  PhoneOutlined,
  BusinessOutlined,
  AccountCircleOutlined,
  LockOutlined,
  Close,
} from '@mui/icons-material';


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    college: '',
    degree: '',
    batch_year: '',
    // Alumni-specific fields
    job_title: '',
    current_company: '',
    willing_to_mentor: false,
  });

  const brandPrimary = '#2563eb';
  const brandDark = '#09090b';
  const brandBg = '#f8fafc';
  const red = '#dc2626';

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
      // Clear batch_year to ensure selection matches new role's year range
      setFormData(prev => ({ ...prev, batch_year: '' }));
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if ((name === "first_name" || name === "last_name") && !/^[A-Za-z]*$/.test(value)) return;
    if (name === "phone" && value.length > 10) return;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Client - side Validation 
  const validateForm = () => {
    let newErrors = {};

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.college.trim()) newErrors.college = "College is required";
    if (!formData.degree.trim()) newErrors.degree = "Degree is required";
    if (!formData.batch_year) newErrors.batch_year = "Batch year is required";

    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Alumni-only validation
    if (role === "alumni") {
      if (!formData.job_title.trim()) newErrors.job_title = "Job title is required";
      if (!formData.current_company.trim()) newErrors.current_company = "Company name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // STOP if errors exist

    const payload = { ...formData, role };

    if (role === "student") {
      payload.job_title = "";
      payload.current_company = "";
      payload.willing_to_mentor = false;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/signup/", payload);
      setErrors({});
      setMessage("Signup successful ✅ Please proceed to Login.");
      
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
        setMessage("Error creating account.");
      }
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
           linear-gradient(135deg, ${brandDark} 0%, #09090b 100%)
         `,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ mb: 4, letterSpacing: -0.5 }}>
            GRAD<span style={{ color: brandPrimary }}>LINK</span>
          </Typography>
          <Box sx={{ mt: 10 }}>
            <Typography variant="h3" fontWeight="700" lineHeight={1.2} gutterBottom>
              Bridging the gap between <span style={{ color: brandPrimary }}>ambition</span> and <span style={{ color: brandPrimary }}>success</span>.
            </Typography>

          </Box>
        </Box>

        <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
            "The best way to predict the future is to create it."
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE: Form Area */}
      <Box
        sx={{
          flexGrow: 1,
          ml: { md: '355px', lg: '500px' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 4 } }}>
          {/* Close Button added here */}
          <IconButton
            href="/"
            sx={{
              position: 'relative',
              top: 10,
              left: 800,
              color: 'text.secondary',
              '&:hover': { color: red, bgcolor: 'transparent' }
            }}
          >
            <Close />
          </IconButton>
          <Box component="form" noValidate sx={{ width: '100%' }}>
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="h4" fontWeight="800" color={brandDark} gutterBottom>
                  Get Started
                </Typography>
                <Typography color="text.secondary">
                  Join our exclusive network of professionals and students.
                </Typography>
              </Box>
            </Box>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                1. Select Account Type
              </Typography>
              <ToggleButtonGroup
                value={role}
                exclusive
                onChange={handleRoleChange}
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiToggleButton-root': {
                    py: 2,
                    border: '1px solid #e2e8f0',
                    '&.Mui-selected': {
                      bgcolor: `${brandPrimary}10`,
                      color: brandPrimary,
                      borderColor: brandPrimary,
                    }
                  }
                }}
              >
                <ToggleButton value="student"><School sx={{ mr: 1 }} /> Student</ToggleButton>
                <ToggleButton value="alumni"><Work sx={{ mr: 1 }} /> Alumni</ToggleButton>
              </ToggleButtonGroup>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
                2. Personal Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First Name" name="first_name"
                    type="text" fullWidth value={formData.first_name}
                    onChange={handleChange} error={!!errors.first_name}
                    helperText={errors.first_name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Last Name" name="last_name"
                    type="text" fullWidth value={formData.last_name}
                    onChange={handleChange} error={!!errors.last_name}
                    helperText={errors.last_name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email Address" name="email"
                    type='email' fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        <EmailOutlined fontSize="small" /></InputAdornment>
                    }}
                    value={formData.email} onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone Number" name="phone"
                    type='number' fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        <PhoneOutlined fontSize="small" /></InputAdornment>
                    }}
                    value={formData.phone} onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone} />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
                3. Academic & Professional
              </Typography>
              <Grid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <Grid item xs={12}>
                  <TextField
                    label="College / University"
                    name="college"
                    select
                    fullWidth
                    value={formData.college}
                    onChange={handleChange}
                    error={!!errors.college}
                    helperText={errors.college}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {KERALA_COLLEGES.map((college) => (
                      <MenuItem key={college} value={college}>
                        {college}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Degree / Major"
                    name="degree"
                    select
                    fullWidth
                    value={formData.degree}
                    onChange={handleChange}
                    error={!!errors.degree}
                    helperText={errors.degree}
                  >
                    {KERALA_DEGREES.map((degree) => (
                      <MenuItem key={degree} value={degree}>
                        {degree}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Batch Year" name="batch_year"
                    select
                    fullWidth
                    value={formData.batch_year}
                    error={!!errors.batch_year}
                    helperText={errors.batch_year}
                    onChange={handleChange}>
                    {role === 'alumni' ? (
                      Array.from({ length: new Date().getFullYear() - 1950 }, (_, i) => 1950 + i)
                        .reverse()
                        .map((yr) => (
                          <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                        ))
                    ) : (
                      Array.from({ length: 7 }, (_, i) => new Date().getFullYear() + i)
                        .map((yr) => (
                          <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                        ))
                    )}
                  </TextField>
                </Grid>
                {role === "alumni" && (
                  <>
                    <Grid item xs={12} >
                      <TextField label="Job Title"
                        name="job_title" fullWidth
                        value={formData.job_title}
                        error={!!errors.job_title}
                        helperText={errors.job_title}
                        onChange={handleChange}
                        sx={{ mb: 1 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Current Company"
                        name="current_company"
                        fullWidth
                        value={formData.current_company}
                        onChange={handleChange}
                        error={!!errors.current_company}
                        helperText={errors.current_company}
                        sx={{ mb: 1 }} />
                      <FormControlLabel
                        control={<Checkbox name="willing_to_mentor" checked={formData.willing_to_mentor} onChange={handleChange} />}
                        label={<Typography variant="body2">I am available for mentorship</Typography>}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
                4. Security
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField label="Username"
                    name="username"
                    fullWidth
                    InputProps={{
                      startAdornment:
                        <InputAdornment position="start">
                          <AccountCircleOutlined fontSize="small" />
                        </InputAdornment>
                    }}
                    value={formData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password}
                    value={formData.password} onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    name="confirm_password"
                    fullWidth
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
              </Grid>
            </Paper>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              sx={{ bgcolor: brandDark, py: 2, fontWeight: '700', borderRadius: 2, '&:hover': { bgcolor: brandPrimary } }}
            >
              Create Account as {role === 'student' ? 'Student' : 'Alumni'}
            </Button>

            {message && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                <Typography color="#166534" fontWeight="600">{message}</Typography>
              </Box>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already a member?{' '}
                <Link href="/login" underline="none" sx={{ color: brandPrimary, fontWeight: '700' }}>Login</Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Register;