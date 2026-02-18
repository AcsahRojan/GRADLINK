import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Grid,
    Typography,
    Stack,
    Paper,
    Avatar,
    Button,
    IconButton,
    Divider,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
    TextField as MuiTextField,
} from '@mui/material';
import {
    Edit,
    CameraAlt,
    Email,
    Phone,
    School,
    Check,
    Close,
} from '@mui/icons-material';
import SNavbar from './SNavbar';
import api, { updateProfile } from '../api';


const SProfile = () => {
    const [activeTab, setActiveTab] = useState(0);
    // Section-based editing state
    const [editing, setEditing] = useState({
        contacts: false,
        bio: false,
        education: false
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const primaryBrand = '#6366f1';
    const deepZinc = '#09090b';
    const mutedZinc = '#71717a';
    const glassBorder = 'rgba(228, 228, 231, 0.6)';

    // Initialize mock user if none exists for the preview
    if (!localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify({
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@university.edu",
            phone: "+1 (555) 000-1234",
            college: "Stanford University",
            degree: "B.S. Computer Science",
            batch_year: "2025",
            bio: "Passionate about full-stack development and AI.",
            token: "mock-token"
        }));
    }

    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        college: user?.college || '',
        degree: user?.degree || '',
        batch_year: user?.batch_year || '',
        bio: user?.bio || '',
    });

    useEffect(() => {
        const fetchLatestProfile = async () => {
            try {
                const response = await api.get('profile/update/');
                const latestUser = { ...response.data.user, token: user?.token };
                setUser(latestUser);
                localStorage.setItem("user", JSON.stringify(latestUser));

                setFormData({
                    first_name: latestUser?.first_name || '',
                    last_name: latestUser?.last_name || '',
                    email: latestUser?.email || '',
                    phone: latestUser?.phone || '',
                    college: latestUser?.college || '',
                    degree: latestUser?.degree || '',
                    batch_year: latestUser?.batch_year || '',
                    bio: latestUser?.bio || '',
                });
            } catch (error) {
                console.error("Failed to sync profile", error);
            }
        };
        fetchLatestProfile();
    }, []);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('image', file);
        try {
            const response = await updateProfile(uploadData);
            const updatedUser = { ...response.user, token: user.token };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };

    const handleUpdateProfile = async (section) => {
        try {
            const response = await updateProfile(formData);
            const updatedUser = { ...response.user, token: user.token };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setEditing(prev => ({ ...prev, [section]: false }));
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const handleCancelEdit = (section) => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            college: user?.college || '',
            degree: user?.degree || '',
            batch_year: user?.batch_year || '',
            bio: user?.bio || '',
        });
        setEditing(prev => ({ ...prev, [section]: false }));
    };

    if (!user) return null;

    return (
        <>
            <SNavbar />
            <Box sx={{ bgcolor: '#fcfcfd', minHeight: '100vh', pb: { xs: 2, md: 4, lg: 4 } }}>
                            <Box sx={{ height: { xs: 30, md: 50 } }} />
                            <Container maxWidth="xl" sx={{ px: { xs: 1.5, md: 4 }, pt: { xs: 2, md: 4 } }}>
                                <Grid container spacing={{ xs: 2, md: 4 }} display={'grid'} gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }}>
                                    {/* Left Profile Card */}
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
                                }}>
                                    <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                                    <IconButton
                                        size="small"
                                        onClick={() => fileInputRef.current.click()}
                                        sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                                    >
                                        <CameraAlt fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ px: 4, pb: 5, mt: -7, textAlign: 'center' }}>
                                    <Avatar
                                        src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000${user.image}`) : ''}
                                        sx={{ width: 130, height: 130, margin: '0 auto', border: '5px solid white', bgcolor: primaryBrand, fontSize: '2.5rem', fontWeight: 800 }}
                                    >
                                        {!user.image && `${user.first_name?.charAt(0)}${user.last_name?.charAt(0)}`}
                                    </Avatar>

                                    {editing.contacts ? (
                                        <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'center' }}>
                                            <MuiTextField name="first_name" value={formData.first_name} onChange={handleInputChange} size="small" placeholder="First" />
                                            <MuiTextField name="last_name" value={formData.last_name} onChange={handleInputChange} size="small" placeholder="Last" />
                                        </Stack>
                                    ) : (
                                        <Typography variant="h5" fontWeight="800" sx={{ mt: 3 }}>
                                            {user.first_name} {user.last_name}
                                        </Typography>
                                    )}
                                    <Typography variant="body1" color={mutedZinc} fontWeight="500">Student</Typography>

                                    <Divider sx={{ my: 4 }} />

                                    <Stack spacing={{ xs: 1.5, md: 2.5 }} sx={{ textAlign: 'left' }}>
                                                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                                                <Email sx={{ color: mutedZinc, fontSize: { xs: '1.1rem', md: '1.25rem' }, mt: 0.3 }} />
                                                                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                                                                    <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block">EMAIL</Typography>
                                                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, wordBreak: 'break-word' }}>
                                                                                        {user.email}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                                                <Phone sx={{ color: mutedZinc, fontSize: { xs: '1.1rem', md: '1.25rem' }, mt: 0.3 }} />
                                                                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                                                                    <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block">PHONE</Typography>
                                                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                                                                        {user.phone || 'Not provided'}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                                                <School sx={{ color: mutedZinc, fontSize: { xs: '1.1rem', md: '1.25rem' }, mt: 0.3 }} />
                                                                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                                                                    <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block">DEGREE</Typography>
                                                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                                                                        {user.degree}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Stack>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Right Detailed Info */}
                        <Grid item xs={12} md={7} lg={8}>
                            <Box sx={{ borderBottom: 1, borderColor: glassBorder, mb: 4 }}>
                                <Tabs value={activeTab} onChange={handleTabChange} TabIndicatorProps={{ sx: { bgcolor: primaryBrand, height: 3 } }}>
                                    <Tab label="About" sx={{ fontWeight: 700 }} />
                                    <Tab label="Activity" sx={{ fontWeight: 700 }} />
                                    <Tab label="Settings" sx={{ fontWeight: 700 }} />
                                </Tabs>
                            </Box>

                            {activeTab === 0 && (
                                <Stack spacing={{ xs: 2.5, md: 4 }}>
                                    {/* Contact Info Card */}
                                    <Paper elevation={0} sx={{
                                        p: { xs: 2.5, md: 4 },
                                        borderRadius: { xs: '16px', md: '24px' },
                                        border: '1px solid rgba(228, 228, 231, 0.6)',
                                        position: 'relative',
                                        minHeight: editing.contacts ? 'auto' : '200px'
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                                Contact Information
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditing(prev => ({ ...prev, contacts: !prev.contacts }))}
                                            >
                                                {editing.contacts ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                        <Grid container spacing={2} direction="column">
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ mb: 0.5 }}>FIRST NAME</Typography>
                                                {editing.contacts ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{user.first_name}</Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ mb: 0.5 }}>LAST NAME</Typography>
                                                {editing.contacts ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{user.last_name}</Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ mb: 0.5 }}>EMAIL</Typography>
                                                {editing.contacts ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{user.email}</Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ mb: 0.5 }}>PHONE</Typography>
                                                {editing.contacts ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{user.phone || 'Not provided'}</Typography>
                                                )}
                                            </Grid>
                                            {editing.contacts && (
                                                <Grid item xs={12}>
                                                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                                        <Button variant="outlined" onClick={() => handleCancelEdit('contacts')} sx={{ textTransform: 'none' }}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="contained" onClick={() => handleUpdateProfile('contacts')} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                                                            Save
                                                        </Button>
                                                    </Stack>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                                                    
                                    {/* BIO SECTION */}
                                    <Paper elevation={0} sx={{ p: 5, borderRadius: '24px', border: `1px solid ${glassBorder}` }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="800">Biography</Typography>
                                            {!editing.bio ? (
                                                <IconButton size="small" onClick={() => setEditing(p => ({ ...p, bio: true }))} sx={{ color: primaryBrand }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" onClick={() => handleCancelEdit('bio')} color="error">
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleUpdateProfile('bio')} color="success">
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </Box>
                                        {editing.bio ? (
                                            <MuiTextField fullWidth multiline rows={3} name="bio" value={formData.bio} onChange={handleInputChange} sx={{ mt: 2 }} />
                                        ) : (
                                            <Typography variant="body1" color="#4b5563" sx={{ lineHeight: 1.8, mt: 2 }}>
                                                {user.bio || "No biography available."}
                                            </Typography>
                                        )}
                                    </Paper>

                                    {/* EDUCATION SECTION */}
                                    <Paper elevation={0} sx={{ p: 5, borderRadius: '24px', border: `1px solid ${glassBorder}` }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="800">Education</Typography>
                                            {!editing.education ? (
                                                <IconButton size="small" onClick={() => setEditing(p => ({ ...p, education: true }))} sx={{ color: primaryBrand }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" onClick={() => handleCancelEdit('education')} color="error">
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleUpdateProfile('education')} color="success">
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </Box>
                                        <Stack spacing={4} sx={{ mt: 3 }}>
                                            <Box sx={{ display: 'flex', gap: 3 }}>
                                                <Box sx={{ p: 2, bgcolor: '#f1f1f4', borderRadius: '16px', alignSelf: 'flex-start' }}>
                                                    <School sx={{ color: primaryBrand, fontSize: 28 }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    {editing.education ? (
                                                        <Stack spacing={2}>
                                                            <MuiTextField fullWidth label="College" name="college" value={formData.college} onChange={handleInputChange} size="small" />
                                                            <Stack direction="row" spacing={2}>
                                                                <MuiTextField fullWidth label="Degree" name="degree" value={formData.degree} onChange={handleInputChange} size="small" />
                                                                <MuiTextField fullWidth label="Batch Year" name="batch_year" type="number" value={formData.batch_year} onChange={handleInputChange} size="small" />
                                                            </Stack>
                                                        </Stack>
                                                    ) : (
                                                        <>
                                                            <Typography variant="h6" fontWeight="800">{user.college}</Typography>
                                                            <Typography variant="body1" color={mutedZinc}>{user.degree}</Typography>
                                                            <Typography variant="caption" color={mutedZinc} fontWeight={600}>Batch Year: {user.batch_year}</Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            )}

                            {activeTab === 1 && (
                                <Paper elevation={0} sx={{ p: 8, borderRadius: '24px', border: `1px solid ${glassBorder}`, textAlign: 'center' }}>
                                    <Typography variant="h5" fontWeight="800">No public activity yet</Typography>
                                </Paper>
                            )}

                            {activeTab === 2 && (
                                <Paper elevation={0} sx={{ p: 5, borderRadius: '24px', border: `1px solid ${glassBorder}` }}>
                                    <Typography variant="h6" fontWeight="800">Account Settings</Typography>
                                    <Typography variant="body2" color={mutedZinc} sx={{ mt: 2 }}>Manage security preferences.</Typography>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default SProfile;