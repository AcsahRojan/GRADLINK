import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Grid, Typography, Stack, Paper, Avatar, Button, Chip,
    IconButton, Divider, Tab, Tabs, Switch, TextField as MuiTextField,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput,
} from '@mui/material';
import {
    Edit, CameraAlt, LinkedIn, GitHub, Language, Email, Phone, School, Verified,
    Close
} from '@mui/icons-material';
import ANavbar from './ANavbar';
import api, { updateProfile, getMentorshipTypes } from '../api';

const AProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [mentorshipTypes, setMentorshipTypes] = useState([]);
    const [storageUser] = useState(() => JSON.parse(localStorage.getItem("user")));
    const [editing, setEditing] = useState({
        contacts: false,
        bio: false,
        professional: false,
        education: false
    });

    const primaryBrand = '#6366f1';
    const deepZinc = '#09090b';
    const mutedZinc = '#71717a';
    const lightBg = '#fcfcfd';

    useEffect(() => {
        if (!storageUser || storageUser.role !== 'alumni') {
            navigate(storageUser?.role === 'student' ? '/studenthome' : '/login');
        }
    }, [navigate, storageUser]);

    const [user, setUser] = useState(storageUser);
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
        job_title: user?.alumni_profile?.job_title || '',
        current_company: user?.alumni_profile?.current_company || '',
        industry: user?.alumni_profile?.industry || '',
        years_of_experience: user?.alumni_profile?.years_of_experience || '',
        linkedin_url: user?.alumni_profile?.linkedin_url || '',
        willing_to_mentor: user?.alumni_profile?.willing_to_mentor || false,
        available_for: user?.alumni_profile?.available_for?.map(t => typeof t === 'object' ? t.id : t) || []
    });

    useEffect(() => {
        const fetchLatestProfile = async () => {
            try {
                const response = await api.get('profile/update/');
                const latestUser = { ...response.data.user, token: user.token };
                setUser(latestUser);
                localStorage.setItem("user", JSON.stringify(latestUser));
                updateFormData(latestUser);
            } catch (error) {
                console.error("Failed to sync profile", error);
            }
        };

        const fetchTypes = async () => {
            try {
                const types = await getMentorshipTypes();
                setMentorshipTypes(types);
            } catch (error) {
                console.error("Failed to fetch mentorship types", error);
            }
        };

        fetchLatestProfile();
        fetchTypes();
    }, []);

    const updateFormData = (userData) => {
        setFormData({
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            college: userData?.college || '',
            degree: userData?.degree || '',
            batch_year: userData?.batch_year || '',
            bio: userData?.bio || '',
            job_title: userData?.alumni_profile?.job_title || '',
            current_company: userData?.alumni_profile?.current_company || '',
            industry: userData?.alumni_profile?.industry || '',
            years_of_experience: userData?.alumni_profile?.years_of_experience || '',
            linkedin_url: userData?.alumni_profile?.linkedin_url || '',
            willing_to_mentor: userData?.alumni_profile?.willing_to_mentor || false,
            available_for: userData?.alumni_profile?.available_for?.map(t => typeof t === 'object' ? t.id : t) || []
        });
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    const handleUpdateProfile = async () => {
        try {
            const response = await updateProfile(formData);
            const updatedUser = { ...response.user, token: user.token };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            updateFormData(updatedUser);
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const cancelEdit = () => {
        updateFormData(user);
        setEditing({ contacts: false, bio: false, professional: false, education: false });
    };

    const cancelSection = (section) => {
        if (section === 'contacts') {
            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                linkedin_url: user.alumni_profile?.linkedin_url || ''
            }));
        } else if (section === 'bio') {
            setFormData(prev => ({ ...prev, bio: user.bio || '' }));
        } else if (section === 'professional') {
            setFormData(prev => ({
                ...prev,
                job_title: user.alumni_profile?.job_title || '',
                current_company: user.alumni_profile?.current_company || '',
                industry: user.alumni_profile?.industry || '',
                years_of_experience: user.alumni_profile?.years_of_experience || '',
                willing_to_mentor: user.alumni_profile?.willing_to_mentor || false,
                available_for: user.alumni_profile?.available_for?.map(t => (typeof t === 'object' ? t.id : t)) || []
            }));
        } else if (section === 'education') {
            setFormData(prev => ({ ...prev, college: user.college || '', degree: user.degree || '', batch_year: user.batch_year || '' }));
        }
        setEditing(prev => ({ ...prev, [section]: false }));
    };

    const saveSection = async (section) => {
        try {
            await handleUpdateProfile();
            setEditing(prev => ({ ...prev, [section]: false }));
            const latest = JSON.parse(localStorage.getItem('user'));
            if (latest) setUser(latest);
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    if (!user) return null;

    const EditableSection = ({ section, title, icon: Icon, children }) => (
        <Paper elevation={0} sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: { xs: '16px', md: '24px' },
            border: '1px solid rgba(228, 228, 231, 0.6)',
            position: 'relative'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {Icon && <Icon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />}
                    {title}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => setEditing(prev => ({ ...prev, [section]: !prev[section] }))}
                >
                    {editing[section] ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                </IconButton>
            </Stack>
            {children}
            {editing[section] && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => cancelSection(section)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => saveSection(section)} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                        Save
                    </Button>
                </Stack>
            )}
        </Paper>
    );

    return (
        <>
            <ANavbar />
            <Box sx={{ bgcolor: lightBg, minHeight: '100vh', pb: { xs: 2, md: 4, lg: 4 } }}>
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
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => fileInputRef.current.click()}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                        }}
                                    >
                                        <CameraAlt fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 5 }, mt: { xs: -5, md: -7 }, textAlign: 'center' }}>
                                    <Avatar
                                        src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000${user.image}`) : ''}
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
                                        {!user.image && `${user.first_name?.charAt(0)}${user.last_name?.charAt(0)}`}
                                    </Avatar>

                                    <Typography variant="h6" fontWeight="800" sx={{
                                        mt: { xs: 1.5, md: 3 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                    }}>
                                        {user.first_name} {user.last_name}
                                        <Verified sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: primaryBrand }} />
                                    </Typography>

                                    <Typography variant="body2" color={mutedZinc} fontWeight="500" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, mt: 0.5 }}>
                                        {user.alumni_profile?.job_title} @ {user.alumni_profile?.current_company}
                                    </Typography>

                                    <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: { xs: 1.5, md: 3 } }}>
                                        <IconButton
                                            href={user.alumni_profile?.linkedin_url || ''}
                                            size="small"
                                            sx={{
                                                color: deepZinc,
                                                border: '1px solid rgba(228, 228, 231, 0.6)',
                                                borderRadius: '8px',
                                                '&:hover': { borderColor: primaryBrand }
                                            }}
                                        >
                                            <LinkedIn fontSize="small" />
                                        </IconButton>

                                    </Stack>

                                    <Divider sx={{ my: { xs: 2, md: 3 } }} />

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

                        {/* Right Content */}
                        <Grid item xs={12} md={7} lg={8}>
                            <Box sx={{ borderBottom: 1, borderColor: 'rgba(228, 228, 231, 0.6)', mb: { xs: 3, md: 4 } }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(e, v) => setActiveTab(v)}
                                    variant="fullWidth"
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontWeight: 700,
                                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                                            textTransform: 'none',
                                            py: { xs: 1.5, md: 2 }
                                        },
                                        '& .MuiTabs-indicator': { bgcolor: primaryBrand, height: 3 }
                                    }}
                                >
                                    <Tab label="About" />
                                    <Tab label="Activity" />
                                    <Tab label="Settings" />
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
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ mb: 0.5 }}>LINKEDIN URL</Typography>
                                                {editing.contacts ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="linkedin_url"
                                                        value={formData.linkedin_url}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{user.alumni_profile?.linkedin_url || 'Not provided'}</Typography>
                                                )}
                                            </Grid>
                                            {editing.contacts && (
                                                <Grid item xs={12}>
                                                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                                        <Button variant="outlined" onClick={() => cancelSection('contacts')} sx={{ textTransform: 'none' }}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="contained" onClick={() => saveSection('contacts')} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                                                            Save
                                                        </Button>
                                                    </Stack>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>

                                    {/* Bio Section */}
                                    <Paper elevation={0} sx={{
                                        p: { xs: 2.5, md: 4 },
                                        borderRadius: { xs: '16px', md: '24px' },
                                        border: '1px solid rgba(228, 228, 231, 0.6)',
                                        position: 'relative',
                                        minHeight: editing.bio ? 'auto' : '120px'
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                                Note to Mentees
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditing(prev => ({ ...prev, bio: !prev.bio }))}
                                            >
                                                {editing.bio ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                        {editing.bio ? (
                                            <>
                                                <MuiTextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    size="small"
                                                    sx={{ mb: 2 }}
                                                />
                                                <Stack direction="row" spacing={1.5}>
                                                    <Button variant="outlined" onClick={() => cancelSection('bio')} sx={{ textTransform: 'none' }}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="contained" onClick={() => saveSection('bio')} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                                                        Save
                                                    </Button>
                                                </Stack>
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="#4b5563" sx={{ lineHeight: 1.8, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                                                {user.bio || "No biography available."}
                                            </Typography>
                                        )}
                                    </Paper>

                                    {/* Professional Section */}
                                    <Paper elevation={0} sx={{
                                        p: { xs: 2.5, md: 4 },
                                        borderRadius: { xs: '16px', md: '24px' },
                                        border: '1px solid rgba(228, 228, 231, 0.6)',
                                        position: 'relative',
                                        minHeight: editing.professional ? 'auto' : '250px'
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                                Professional Details
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditing(prev => ({ ...prev, professional: !prev.professional }))}
                                            >
                                                {editing.professional ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                        <Grid container spacing={{ xs: 2, md: 3 }} direction="column">
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" fontWeight="bold" color={mutedZinc} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                                    Industry
                                                </Typography>
                                                {editing.professional ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="industry"
                                                        value={formData.industry}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                                        {user.alumni_profile?.industry || "Not specified"}
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" fontWeight="bold" color={mutedZinc} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                                    Experience
                                                </Typography>
                                                {editing.professional ? (
                                                    <MuiTextField
                                                        fullWidth
                                                        name="years_of_experience"
                                                        type="number"
                                                        value={formData.years_of_experience}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                                        {user.alumni_profile?.years_of_experience || "0"} Years
                                                    </Typography>
                                                )}
                                            </Grid>
                                            {editing.professional && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Available For Mentorship</InputLabel>
                                                            <Select
                                                                multiple
                                                                value={formData.available_for}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, available_for: e.target.value }))}
                                                                input={<OutlinedInput label="Available For Mentorship" />}
                                                                renderValue={(selected) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {selected.map((value) => (
                                                                            <Chip key={value} label={mentorshipTypes.find(t => t.id === value)?.name || value} size="small" />
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            >
                                                                {mentorshipTypes.map((type) => (
                                                                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Box sx={{
                                                            p: { xs: 1.5, md: 2 },
                                                            bgcolor: '#f8fafc',
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(228, 228, 231, 0.6)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                                                                Willing to mentor
                                                            </Typography>
                                                            <Switch
                                                                checked={formData.willing_to_mentor}
                                                                onChange={handleInputChange}
                                                                name="willing_to_mentor"
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Stack direction="row" spacing={1.5}>
                                                            <Button variant="outlined" onClick={() => cancelSection('professional')} sx={{ textTransform: 'none' }}>
                                                                Cancel
                                                            </Button>
                                                            <Button variant="contained" onClick={() => saveSection('professional')} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                                                                Save
                                                            </Button>
                                                        </Stack>
                                                    </Grid>
                                                </>
                                            )}
                                            {!editing.professional && (
                                                <Grid item xs={12}>
                                                    <Box sx={{
                                                        p: { xs: 1.5, md: 2 },
                                                        bgcolor: '#f8fafc',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(228, 228, 231, 0.6)'
                                                    }}>
                                                        <Typography variant="caption" fontWeight="600" color={mutedZinc} display="block" sx={{ textTransform: 'uppercase', mb: 1 }}>
                                                            Available For
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {user.alumni_profile?.available_for?.length > 0 ? (
                                                                user.alumni_profile.available_for.map((item) => (
                                                                    <Chip
                                                                        key={item.id}
                                                                        label={item.name}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            bgcolor: `${primaryBrand}10`,
                                                                            color: primaryBrand
                                                                        }}
                                                                    />
                                                                ))
                                                            ) : (
                                                                <Typography variant="caption" color={mutedZinc}>None selected</Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>

                                    {/* Education Section */}
                                    <Paper elevation={0} sx={{
                                        p: { xs: 2.5, md: 4 },
                                        borderRadius: { xs: '16px', md: '24px' },
                                        border: '1px solid rgba(228, 228, 231, 0.6)',
                                        position: 'relative',
                                        minHeight: editing.education ? 'auto' : '150px'
                                    }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                                Education
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditing(prev => ({ ...prev, education: !prev.education }))}
                                            >
                                                {editing.education ? <Close fontSize="small" /> : <Edit fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Box sx={{ p: 1.5, bgcolor: '#f1f1f4', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                                                    <School sx={{ color: primaryBrand, fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    {editing.education ? (
                                                        <>
                                                            <MuiTextField
                                                                fullWidth
                                                                name="college"
                                                                value={formData.college}
                                                                onChange={handleInputChange}
                                                                size="small"
                                                                sx={{ mb: 1.5 }}
                                                                placeholder="College"
                                                            />
                                                            <Stack direction="column" spacing={1.5} sx={{ mb: 2 }}>
                                                                <MuiTextField
                                                                    fullWidth
                                                                    name="degree"
                                                                    value={formData.degree}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    placeholder="Degree"
                                                                />
                                                                <MuiTextField
                                                                    fullWidth
                                                                    name="batch_year"
                                                                    type="number"
                                                                    value={formData.batch_year}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    placeholder="Batch Year"
                                                                />
                                                            </Stack>
                                                            <Stack direction="row" spacing={1.5}>
                                                                <Button variant="outlined" onClick={() => cancelSection('education')} sx={{ textTransform: 'none' }}>
                                                                    Cancel
                                                                </Button>
                                                                <Button variant="contained" onClick={() => saveSection('education')} sx={{ bgcolor: deepZinc, textTransform: 'none' }}>
                                                                    Save
                                                                </Button>
                                                            </Stack>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                                                                {user.college}
                                                            </Typography>
                                                            <Typography variant="body2" color={mutedZinc} sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                                                                {user.degree}
                                                            </Typography>
                                                            <Typography variant="caption" color={mutedZinc} fontWeight="600" sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
                                                                Batch Year: {user.batch_year}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            )}

                            {activeTab === 1 && (
                                <Paper elevation={0} sx={{
                                    p: { xs: 4, md: 8 },
                                    borderRadius: { xs: '16px', md: '24px' },
                                    border: '1px solid rgba(228, 228, 231, 0.6)',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="h6" fontWeight="800" color={mutedZinc} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                        No activity yet
                                    </Typography>
                                </Paper>
                            )}

                            {activeTab === 2 && (
                                <Paper elevation={0} sx={{
                                    p: { xs: 3, md: 5 },
                                    borderRadius: { xs: '16px', md: '24px' },
                                    border: '1px solid rgba(228, 228, 231, 0.6)'
                                }}>
                                    <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                        Account Settings
                                    </Typography>
                                    <Typography variant="body2" color={mutedZinc} sx={{ mt: 2, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                                        Settings coming soon...
                                    </Typography>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default AProfile;