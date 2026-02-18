import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Stack, Button, Card, CardContent,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, IconButton, Chip, Paper, Avatar, Divider, Badge, Tooltip,
    Tabs, Tab
} from '@mui/material';
import {
    Add, Business, LocationOn, Work, DeleteOutline,
    Description, Person, CancelOutlined
} from '@mui/icons-material';
import ANavbar from './ANavbar';
import { getJobs, createJob, deleteJob, getReferrals, updateReferral } from '../api';

const AlumniJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        title: '', company: '', location: '', description: '',
        job_type: 'full_time', link: ''
    });

    const primaryBrand = '#6366f1';
    const deepZinc = '#09090b';
    const lightBg = '#fafafa';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const jobData = await getJobs({ my_jobs: 'true' });
            const referralData = await getReferrals();
            setJobs(jobData);
            setReferrals(referralData);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async () => {
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.link) delete dataToSubmit.link;
            await createJob(dataToSubmit);
            setOpen(false);
            setFormData({ title: '', company: '', location: '', description: '', job_type: 'full_time', link: '' });
            fetchData();
        } catch (err) {
            console.error("Failed to post job", err);
            alert("Failed to post job: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
        }
    };

    const handleDeleteJob = async (id) => {
        if (window.confirm("Delete this job posting?")) {
            await deleteJob(id);
            fetchData();
        }
    };

    const handleUpdateReferral = async (id, status) => {
        try {
            await updateReferral(id, { status });
            fetchData();
        } catch (err) {
            console.error("Failed to update referral", err);
        }
    };

    const pendingCount = referrals.filter(r => r.status === 'pending').length;

    return (
        <>
            <ANavbar />
            <Box sx={{ bgcolor: lightBg, minHeight: '100vh', pb: { xs: 6, md: 10 } }}>
                {/* Hero Section */}
                <Box sx={{
                    background: `linear-gradient(135deg, ${deepZinc} 0%, #18181b 100%)`,
                    color: '#fff',
                    pt: { xs: 10, md: 16 },
                    pb: { xs: 8, md: 10 },
                    mb: { xs: 3, md: 4 },
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: -30, md: -50 },
                        right: { xs: -30, md: -50 },
                        width: { xs: 200, md: 300 },
                        height: { xs: 200, md: 300 },
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${primaryBrand}15 0%, transparent 70%)`
                    }} />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack 
                            direction={{ xs: 'column', md: 'row' }} 
                            justifyContent="space-between" 
                            alignItems={{ xs: 'flex-start', md: 'center' }} 
                            spacing={{ xs: 3, md: 4 }}
                        >
                            <Box>
                                <Typography variant="h2" fontWeight="900" sx={{ 
                                    letterSpacing: -3, 
                                    mb: 1,
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
                                }}>
                                    Talent <span style={{ color: primaryBrand }}>Hub</span>
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    opacity: 0.7, 
                                    maxWidth: 500, 
                                    fontWeight: 500,
                                    fontSize: { xs: '0.9rem', md: '1.1rem' }
                                }}>
                                    Empower the next generation by sharing opportunities and referring top talent.
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                disableElevation
                                startIcon={<Add />}
                                onClick={() => setOpen(true)}
                                sx={{
                                    bgcolor: primaryBrand,
                                    borderRadius: '16px',
                                    px: { xs: 2.5, md: 4 },
                                    py: { xs: 1.3, md: 2 },
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: { xs: '0.85rem', md: '1rem' },
                                    whiteSpace: 'nowrap',
                                    '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Post Job
                            </Button>
                        </Stack>
                    </Container>
                </Box>

                <Container maxWidth="lg">
                    {/* Tabs Navigation */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderBottom: `2px solid #e2e8f0`,
                            mb: { xs: 3, md: 4 },
                            bgcolor: 'transparent'
                        }}
                    >
                        <Tabs 
                            value={tabValue} 
                            onChange={(e, newValue) => setTabValue(newValue)}
                            sx={{
                                '& .MuiTab-root': {
                                    fontSize: { xs: '0.8rem', md: '0.95rem' },
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    color: '#94a3b8',
                                    py: { xs: 1.5, md: 2 },
                                    px: { xs: 1.5, md: 3 },
                                    minWidth: { xs: 'auto', md: 140 },
                                    display: 'flex',
                                    gap: 1,
                                    '&.Mui-selected': {
                                        color: deepZinc
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    bgcolor: primaryBrand,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab 
                                label={`Active Postings (${jobs.length})`}
                                icon={<Work sx={{ fontSize: '1rem' }} />}
                                iconPosition="start"
                            />
                            <Tab 
                                label={`Student Requests`}
                                icon={
                                    <Badge 
                                        badgeContent={pendingCount} 
                                        color="error" 
                                        overlap="circular"
                                        sx={{ fontSize: '0.7rem' }}
                                    >
                                        <Person sx={{ fontSize: '1rem' }} />
                                    </Badge>
                                }
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>

                    {/* Tab Content */}
                    <Box>
                        {/* Active Postings Tab */}
                        {tabValue === 0 && (
                            <Stack spacing={{ xs: 2, md: 3 }}>
                                {jobs.length > 0 ? (
                                    jobs.map(job => (
                                        <Card
                                            key={job.id}
                                            elevation={0}
                                            sx={{
                                                borderRadius: { xs: '16px', md: '24px' },
                                                border: '1px solid #f1f5f9',
                                                bgcolor: '#fff',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    transform: 'translateY(-3px)', 
                                                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                                    borderColor: primaryBrand
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography 
                                                            variant="h6" 
                                                            fontWeight="900" 
                                                            color={deepZinc} 
                                                            sx={{ 
                                                                mb: 1.5, 
                                                                fontSize: { xs: '1rem', md: '1.25rem' },
                                                                wordBreak: 'break-word'
                                                            }}
                                                        >
                                                            {job.title}
                                                        </Typography>
                                                        <Stack 
                                                            direction="row" 
                                                            spacing={1} 
                                                            sx={{ 
                                                                flexWrap: 'wrap', 
                                                                gap: 1, 
                                                                mb: 2 
                                                            }}
                                                        >
                                                            <Chip
                                                                icon={<Business sx={{ fontSize: '0.85rem !important' }} />}
                                                                label={job.company}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ 
                                                                    borderRadius: '8px', 
                                                                    fontWeight: 600,
                                                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                                    borderColor: '#e2e8f0' 
                                                                }}
                                                            />
                                                            <Chip
                                                                icon={<LocationOn sx={{ fontSize: '0.85rem !important' }} />}
                                                                label={job.location}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ 
                                                                    borderRadius: '8px', 
                                                                    fontWeight: 600,
                                                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                                    borderColor: '#e2e8f0' 
                                                                }}
                                                            />
                                                            <Chip
                                                                label={job.job_type.replace('_', ' ').toUpperCase()}
                                                                size="small"
                                                                sx={{ 
                                                                    borderRadius: '8px', 
                                                                    fontWeight: 700, 
                                                                    fontSize: '0.65rem',
                                                                    bgcolor: `${primaryBrand}12`, 
                                                                    color: primaryBrand 
                                                                }}
                                                            />
                                                        </Stack>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary" 
                                                            sx={{ 
                                                                opacity: 0.8, 
                                                                lineHeight: 1.5,
                                                                fontSize: { xs: '0.8rem', md: '0.9rem' }
                                                            }}
                                                        >
                                                            {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                                                        </Typography>
                                                    </Box>
                                                    <Tooltip title="Delete job">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: '#fef2f2', 
                                                                border: '1px solid #fee2e2', 
                                                                borderRadius: '10px',
                                                                width: { xs: 32, md: 40 },
                                                                height: { xs: 32, md: 40 },
                                                                '&:hover': { bgcolor: '#fee2e2' }
                                                            }}
                                                        >
                                                            <DeleteOutline fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Paper 
                                        sx={{ 
                                            p: { xs: 4, md: 8 }, 
                                            textAlign: 'center', 
                                            borderRadius: '24px', 
                                            bgcolor: '#fff', 
                                            border: '1px dashed #e2e8f0' 
                                        }} 
                                        elevation={0}
                                    >
                                        <Work sx={{ fontSize: 40, color: '#e2e8f0', mb: 2 }} />
                                        <Typography fontWeight="700" color="#94a3b8" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                            No active job postings yet
                                        </Typography>
                                        <Typography variant="caption" color="#94a3b8" sx={{ mt: 1, display: 'block' }}>
                                            Post your first job to get started
                                        </Typography>
                                    </Paper>
                                )}
                            </Stack>
                        )}

                        {/* Student Requests Tab */}
                        {tabValue === 1 && (
                            <Stack spacing={{ xs: 2, md: 2.5 }}>
                                {referrals.length > 0 ? (
                                    referrals.map(ref => (
                                        <Card
                                            key={ref.id}
                                            elevation={0}
                                            sx={{
                                                borderRadius: { xs: '16px', md: '20px' },
                                                border: '1px solid #f1f5f9',
                                                bgcolor: ref.status === 'pending' ? '#fff' : '#f8fafc',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    transform: ref.status === 'pending' ? 'translateY(-2px)' : 'none', 
                                                    borderColor: ref.status === 'pending' ? primaryBrand : '#f1f5f9'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                                {/* Header */}
                                                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                                                    <Avatar 
                                                        sx={{ 
                                                            bgcolor: primaryBrand, 
                                                            fontWeight: 900, 
                                                            fontSize: '0.85rem',
                                                            width: { xs: 32, md: 40 },
                                                            height: { xs: 32, md: 40 }
                                                        }}
                                                    >
                                                        {ref.student_full_name[0]}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            fontWeight="900" 
                                                            color={deepZinc}
                                                            sx={{ 
                                                                fontSize: { xs: '0.85rem', md: '0.95rem' },
                                                                wordBreak: 'break-word'
                                                            }}
                                                        >
                                                            {ref.student_full_name}
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption" 
                                                            color={primaryBrand} 
                                                            fontWeight="600"
                                                            sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                                                        >
                                                            for {ref.job_title}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={ref.status.toUpperCase()}
                                                        size="small"
                                                        color={ref.status === 'pending' ? 'warning' : ref.status === 'referred' ? 'success' : 'default'}
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            fontSize: '0.6rem', 
                                                            height: 20 
                                                        }}
                                                    />
                                                </Stack>

                                                {/* Message */}
                                                <Paper 
                                                    elevation={0} 
                                                    sx={{ 
                                                        p: { xs: 1.5, md: 2 }, 
                                                        borderRadius: '12px', 
                                                        bgcolor: '#f1f5f9', 
                                                        mb: 2, 
                                                        border: '1px solid #e2e8f0' 
                                                    }}
                                                >
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontStyle: 'italic', 
                                                            color: '#475569', 
                                                            lineHeight: 1.4,
                                                            fontSize: { xs: '0.75rem', md: '0.85rem' }
                                                        }}
                                                    >
                                                        "{ref.message}"
                                                    </Typography>
                                                </Paper>

                                                {/* Actions */}
                                                <Stack 
                                                    direction={{ xs: 'column', sm: 'row' }} 
                                                    spacing={1}
                                                >
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disableElevation
                                                        startIcon={<Description sx={{ fontSize: '0.9rem' }} />}
                                                        href={ref.resume.startsWith('http') ? ref.resume : `http://localhost:8000${ref.resume}`}
                                                        target="_blank"
                                                        sx={{ 
                                                            textTransform: 'none', 
                                                            borderRadius: '8px', 
                                                            fontWeight: 600, 
                                                            border: '1.5px solid #e2e8f0', 
                                                            color: deepZinc,
                                                            fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                            py: { xs: 0.7, md: 1 }
                                                        }}
                                                    >
                                                        Resume
                                                    </Button>
                                                    {ref.status === 'pending' && (
                                                        <Stack direction="row" spacing={0.5} sx={{ flex: 1 }}>
                                                            <Button
                                                                fullWidth
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                disableElevation
                                                                onClick={() => handleUpdateReferral(ref.id, 'referred')}
                                                                sx={{ 
                                                                    textTransform: 'none', 
                                                                    borderRadius: '8px', 
                                                                    fontWeight: 700,
                                                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                                    py: { xs: 0.7, md: 1 }
                                                                }}
                                                            >
                                                                Refer
                                                            </Button>
                                                            <Tooltip title="Reject">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleUpdateReferral(ref.id, 'rejected')}
                                                                    sx={{ 
                                                                        bgcolor: '#fef2f2', 
                                                                        borderRadius: '8px',
                                                                        width: { xs: 32, md: 36 },
                                                                        height: { xs: 32, md: 36 },
                                                                        '&:hover': { bgcolor: '#fee2e2' }
                                                                    }}
                                                        >
                                                            <CancelOutlined fontSize="small" />
                                                        </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
                                        <Person sx={{ fontSize: 40, color: '#e2e8f0', mb: 2 }} />
                                        <Typography color="text.secondary" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                            No student requests yet
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Post Job Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: { xs: 1.5, md: 2 }
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    letterSpacing: -0.5,
                    pb: 1
                }}>
                    Post a Job Opening
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2.5 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Job Title"
                            fullWidth
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Company"
                                fullWidth
                                placeholder="Google"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <TextField
                                label="Location"
                                fullWidth
                                placeholder="San Francisco, CA"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Stack>
                        <TextField
                            select
                            label="Employment Type"
                            fullWidth
                            value={formData.job_type}
                            onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <MenuItem value="full_time">Full Time</MenuItem>
                            <MenuItem value="internship">Internship</MenuItem>
                            <MenuItem value="contract">Contract</MenuItem>
                        </TextField>
                        <TextField
                            label="Job Description"
                            placeholder="Describe the role, requirements, and responsibilities..."
                            fullWidth 
                            multiline 
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="External Link (Optional)"
                            placeholder="https://careers.company.com/..."
                            fullWidth
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{ 
                            textTransform: 'none', 
                            color: 'text.secondary', 
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', md: '0.9rem' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePostJob}
                        variant="contained"
                        disableElevation
                        sx={{
                            bgcolor: deepZinc,
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            fontSize: { xs: '0.8rem', md: '0.9rem' },
                            '&:hover': { bgcolor: '#000' }
                        }}
                    >
                        Publish
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AlumniJobs;