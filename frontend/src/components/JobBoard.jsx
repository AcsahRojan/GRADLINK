import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Container, Typography, Stack, Button, Card, CardContent,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
    IconButton, Chip, Paper, Avatar, InputAdornment, Tooltip, Tabs, Tab, Divider, Grid
} from '@mui/material';
import {
    Search, LocationOn, Work, OpenInNew, Send, Description, 
    EmojiEvents, CheckCircleOutline
} from '@mui/icons-material';
import SNavbar from './SNavbar';
import { getJobs, createReferral, getReferrals } from '../api';

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

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);
    const [referralOpen, setReferralOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [resume, setResume] = useState(null);
    const [requestedJobIds, setRequestedJobIds] = useState(new Set());
    const [referrals, setReferrals] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const heroRef = useRef(null);
    const reducedMotion = usePrefersReducedMotion();

    const primaryBrand = '#6366f1';
    const deepZinc = '#09090b';
    const lightBg = '#fafafa';

    const handleHeroSpotlight = (e) => {
        if (reducedMotion || !heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        heroRef.current.style.setProperty("--mouse-x", `${x}%`);
        heroRef.current.style.setProperty("--mouse-y", `${y}%`);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchJobs(), fetchReferrals()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        }
    };

    const fetchReferrals = async () => {
        try {
            const data = await getReferrals();
            setReferrals(data);
            const ids = new Set(data.map(ref => ref.job));
            setRequestedJobIds(ids);
        } catch (err) {
            console.error("Failed to fetch referrals", err);
        }
    };

    const handleRequestReferral = async () => {
        if (!resume) {
            alert("Please upload your resume.");
            return;
        }
        const formData = new FormData();
        formData.append('job', selectedJob.id);
        formData.append('message', message);
        formData.append('resume', resume);
        formData.append('status', 'pending');

        try {
            await createReferral(formData);
            setReferralOpen(false);
            setMessage('');
            setResume(null);
            setRequestedJobIds(prev => new Set(prev).add(selectedJob.id));
            alert("Referral request sent successfully!");
            fetchReferrals();
        } catch (err) {
            console.error("Failed to send referral", err);
            alert("Failed to send referral request.");
        }
    };

    const filteredJobs = jobs.filter(job =>
        (job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.company.toLowerCase().includes(search.toLowerCase())) &&
        (filter === 'all' || job.job_type === filter)
    );

    const pendingCount = referrals.filter(ref => ref.status === 'pending').length;
    const acceptedCount = referrals.filter(ref => ref.status === 'referred').length;

    return (
        <>
            <SNavbar />
            <Box sx={{ bgcolor: lightBg, minHeight: '100vh', pb: { xs: 6, md: 10 } }}>
                {/* Hero Section */}
                <Box 
                    ref={heroRef}
                    onPointerMove={handleHeroSpotlight}
                    sx={{
                    background: `
                        radial-gradient(
                            800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                            rgba(99, 101, 241, 0.24),
                            transparent 80%
                        ),
                        linear-gradient(135deg, ${deepZinc} 0%, #18181b 100%)
                    `,
                    color: '#fff',
                    pt: { xs: 12, md: 18 },
                    pb: { xs: 10, md: 12 },
                    mb: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.1s ease-out'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: -80, md: -100 },
                        right: { xs: -80, md: -100 },
                        width: { xs: 250, md: 400 },
                        height: { xs: 250, md: 400 },
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${primaryBrand}20 0%, transparent 70%)`
                    }} />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack spacing={{ xs: 2, md: 3 }}>
                            <Typography variant="h2" fontWeight="900" sx={{
                                letterSpacing: -3,
                                lineHeight: 1,
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
                            }}>
                                Find Your Next <span style={{ color: primaryBrand }}>Venture</span>
                            </Typography>
                            <Typography variant="h6" sx={{
                                opacity: 0.7,
                                mb: 4,
                                maxWidth: 600,
                                fontWeight: 500,
                                fontSize: { xs: '0.9rem', md: '1.1rem' }
                            }}>
                                Exclusive opportunities shared directly by your alumni network.
                            </Typography>
                        </Stack>

                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 0.5, md: 0.75 },
                                borderRadius: { xs: '16px', md: '24px' },
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: 700,
                                mt: 2,
                                border: '1px solid rgba(255,255,255,0.1)',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 1, md: 0 }
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Search roles, companies..."
                                variant="standard"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                InputProps={{
                                    disableUnderline: true,
                                    startAdornment: <InputAdornment position="start">
                                        <Search sx={{ ml: { xs: 1, md: 2 }, color: primaryBrand }} />
                                    </InputAdornment>,
                                    sx: { px: { xs: 1, md: 2 }, py: 1, fontWeight: 600, color: '#fff', fontSize: { xs: '0.9rem', md: '1rem' } }
                                }}
                            />
                            <Button
                                variant="contained"
                                disableElevation
                                sx={{
                                    bgcolor: primaryBrand,
                                    borderRadius: { xs: '12px', md: '18px' },
                                    px: { xs: 2, md: 4 },
                                    py: { xs: 1, md: 1.5 },
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: { xs: '0.85rem', md: '1rem' },
                                    '&:hover': { bgcolor: '#4f46e5' }
                                }}
                            >
                                Search
                            </Button>
                        </Paper>
                    </Container>
                </Box>

                {/* Tabs Navigation */}
                <Paper elevation={0} sx={{ borderBottom: `2px solid #e2e8f0`, bgcolor: '#fff', mb: { xs: 4, md: 6 } }}>
                    <Container maxWidth="lg">
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            variant="fullWidth"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '4px 4px 0 0',
                                    bgcolor: primaryBrand
                                },
                                '& .MuiTab-root': {
                                    fontWeight: 700,
                                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                                    textTransform: 'none',
                                    color: '#64748b',
                                    py: { xs: 2, md: 3 },
                                    px: { xs: 1, md: 3 },
                                    display: 'flex',
                                    gap: 1
                                },
                                '& .Mui-selected': { color: `${deepZinc} !important` }
                            }}
                        >
                            <Tab label={`Explore ${jobs.length > 0 ? `(${filteredJobs.length})` : ''}`} icon={<Work />} iconPosition="start" />
                            <Tab label={`Requests ${pendingCount > 0 ? `(${pendingCount})` : ''}`} icon={<Send />} iconPosition="start" />
                            <Tab label={`Accepted ${acceptedCount > 0 ? `(${acceptedCount})` : ''}`} icon={<EmojiEvents />} iconPosition="start" />
                        </Tabs>
                    </Container>
                </Paper>

                <Container maxWidth="lg">
                    {/* Explore Tab */}
                    {activeTab === 0 && (
                        <>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={4} sx={{ overflowX: 'auto', pb: 1 }}>
                                {['all', 'full_time', 'internship'].map(f => (
                                    <Chip
                                        key={f}
                                        label={f === 'all' ? 'All Jobs' : f === 'full_time' ? 'Full Time' : 'Internships'}
                                        onClick={() => setFilter(f)}
                                        variant={filter === f ? 'filled' : 'outlined'}
                                        sx={{
                                            fontWeight: 700,
                                            px: 1,
                                            bgcolor: filter === f ? deepZinc : 'transparent',
                                            color: filter === f ? '#fff' : deepZinc,
                                            borderColor: filter === f ? deepZinc : '#e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </Stack>

                            {filteredJobs.length === 0 ? (
                                <Paper sx={{ p: { xs: 6, md: 10 }, textAlign: 'center', borderRadius: { xs: '20px', md: '40px' }, bgcolor: '#fff', border: '1px dashed #e2e8f0' }} elevation={0}>
                                    <Work sx={{ fontSize: { xs: 36, md: 48 }, color: '#94a3b8', mb: 2 }} />
                                    <Typography variant="h6" fontWeight="800" color={deepZinc}>No jobs found</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>Try adjusting your search or filters</Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={{ xs: 2, md: 4 }} sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    {filteredJobs.map(job => (
                                        <Grid item xs={12} md={6} key={job.id}>
                                            <Card
                                                elevation={0}
                                                sx={{
                                                    borderRadius: { xs: '20px', md: '32px' },
                                                    border: '1px solid #f1f5f9',
                                                    bgcolor: '#fff',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.05)',
                                                        borderColor: primaryBrand
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ p: { xs: 2.5, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2.5}>
                                                        <Avatar
                                                            variant="rounded"
                                                            sx={{
                                                                width: { xs: 48, md: 60 },
                                                                height: { xs: 48, md: 60 },
                                                                bgcolor: '#f8fafc',
                                                                color: primaryBrand,
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: { xs: '12px', md: '16px' },
                                                                fontSize: { xs: '1.2rem', md: '1.5rem' },
                                                                fontWeight: 900
                                                            }}
                                                        >
                                                            {job.company[0]}
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Typography variant="h5" fontWeight="900" color={deepZinc} sx={{ mb: 0.3, fontSize: { xs: '1rem', md: '1.25rem' }, wordBreak: 'break-word' }}>
                                                                {job.title}
                                                            </Typography>
                                                            <Typography variant="subtitle1" color={primaryBrand} fontWeight="700" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                                                                {job.company}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Stack direction="row" spacing={1} mb={2.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                        <Chip
                                                            icon={<LocationOn sx={{ fontSize: '0.9rem !important' }} />}
                                                            label={job.location}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderRadius: '8px',
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                                borderColor: '#e2e8f0',
                                                                color: '#64748b'
                                                            }}
                                                        />
                                                        <Chip
                                                            icon={<Work sx={{ fontSize: '0.9rem !important' }} />}
                                                            label={job.job_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            size="small"
                                                            sx={{
                                                                borderRadius: '8px',
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.7rem', md: '0.8rem' },
                                                                bgcolor: `${primaryBrand}12`,
                                                                color: primaryBrand
                                                            }}
                                                        />
                                                    </Stack>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.6,
                                                            fontWeight: 500,
                                                            fontSize: { xs: '0.85rem', md: '0.9rem' }
                                                        }}
                                                    >
                                                        {job.description}
                                                    </Typography>

                                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Avatar sx={{
                                                                    width: { xs: 20, md: 24 },
                                                                    height: { xs: 20, md: 24 },
                                                                    fontSize: '0.65rem',
                                                                    bgcolor: deepZinc
                                                                }}>
                                                                    {job.posted_by_full_name[0]}
                                                                </Avatar>
                                                                <Typography variant="caption" fontWeight="700" color="#64748b" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                                                    {job.posted_by_full_name}
                                                                </Typography>
                                                            </Stack>
                                                            {job.link && (
                                                                <Tooltip title="View Posting">
                                                                    <IconButton
                                                                        href={job.link}
                                                                        target="_blank"
                                                                        size="small"
                                                                        sx={{
                                                                            border: '1px solid #e2e8f0',
                                                                            borderRadius: '8px',
                                                                            width: { xs: 28, md: 32 },
                                                                            height: { xs: 28, md: 32 },
                                                                            '&:hover': { borderColor: primaryBrand }
                                                                        }}
                                                                    >
                                                                        <OpenInNew fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>

                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            disableElevation
                                                            disabled={requestedJobIds.has(job.id)}
                                                            onClick={() => {
                                                                setSelectedJob(job);
                                                                setReferralOpen(true);
                                                            }}
                                                            sx={{
                                                                bgcolor: requestedJobIds.has(job.id) ? '#f1f5f9' : deepZinc,
                                                                color: requestedJobIds.has(job.id) ? '#94a3b8' : '#fff',
                                                                borderRadius: { xs: '12px', md: '16px' },
                                                                py: { xs: 1, md: 1.5 },
                                                                textTransform: 'none',
                                                                fontWeight: 800,
                                                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                                                transition: 'all 0.3s',
                                                                '&:hover': { bgcolor: requestedJobIds.has(job.id) ? '#f1f5f9' : '#000' }
                                                            }}
                                                        >
                                                            {requestedJobIds.has(job.id) ? '✓ Request Sent' : 'Request Referral'}
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 1 && (
                        <Grid container spacing={{ xs: 2, md: 4 }}>
                            {referrals.filter(ref => ref.status !== 'referred').length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper sx={{
                                        p: { xs: 6, md: 10 },
                                        textAlign: 'center',
                                        borderRadius: { xs: '20px', md: '40px' },
                                        bgcolor: '#fff',
                                        border: '1px dashed #e2e8f0'
                                    }} elevation={0}>
                                        <Description sx={{ fontSize: { xs: 36, md: 48 }, color: '#94a3b8', mb: 2 }} />
                                        <Typography variant="h6" fontWeight="800" color={deepZinc}>No active requests</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                            Your pending and rejected requests will appear here
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                referrals.filter(ref => ref.status !== 'referred').map(ref => (
                                    <Grid item xs={12} key={ref.id}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: { xs: '16px', md: '24px' },
                                                border: '1px solid #f1f5f9',
                                                bgcolor: '#fff',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { transform: 'translateX(4px)', borderColor: primaryBrand }
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: { xs: 40, md: 50 },
                                                            height: { xs: 40, md: 50 },
                                                            bgcolor: '#f8fafc',
                                                            color: deepZinc,
                                                            fontWeight: 800,
                                                            borderRadius: { xs: '8px', md: '12px' },
                                                            fontSize: { xs: '0.9rem', md: '1.1rem' }
                                                        }}
                                                    >
                                                        {ref.company[0]}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5} sx={{ flexWrap: 'wrap' }}>
                                                            <Typography variant="h6" fontWeight="900" color={deepZinc} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                                                {ref.job_title}
                                                            </Typography>
                                                            <Chip
                                                                label={ref.status.toUpperCase()}
                                                                size="small"
                                                                color={ref.status === 'rejected' ? 'error' : 'warning'}
                                                                sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20 }}
                                                            />
                                                        </Stack>
                                                        <Typography variant="body2" fontWeight="700" color={primaryBrand} sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                                            {ref.company}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: { sm: 'right' } }}>
                                                        <Typography variant="caption" fontWeight="700" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                                            Requested
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="800" color={deepZinc} sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                                                            {new Date(ref.requested_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                {ref.message && (
                                                    <>
                                                        <Divider sx={{ my: 2, opacity: 0.5 }} />
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                                            "{ref.message}"
                                                        </Typography>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}

                    {/* Accepted Tab */}
                    {activeTab === 2 && (
                        <Grid container spacing={{ xs: 2, md: 4 }}>
                            {referrals.filter(ref => ref.status === 'referred').length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper sx={{
                                        p: { xs: 6, md: 10 },
                                        textAlign: 'center',
                                        borderRadius: { xs: '20px', md: '40px' },
                                        bgcolor: `${primaryBrand}05`,
                                        border: `1px dashed ${primaryBrand}30`
                                    }} elevation={0}>
                                        <EmojiEvents sx={{ fontSize: { xs: 40, md: 56 }, color: primaryBrand, mb: 2 }} />
                                        <Typography variant="h6" fontWeight="800" color={deepZinc}>No accepted referrals yet</Typography>
                                        <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                            Once an alumnus refers you, their successful endorsement will shine here!
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                referrals.filter(ref => ref.status === 'referred').map(ref => (
                                    <Grid item xs={12} md={6} key={ref.id}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: { xs: '20px', md: '32px' },
                                                border: `2px solid ${primaryBrand}20`,
                                                bgcolor: '#fff',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '6px',
                                                    height: '100%',
                                                    bgcolor: primaryBrand
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                                    <Box>
                                                        <Typography variant="h5" fontWeight="900" color={deepZinc} mb={0.5} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                                            {ref.job_title}
                                                        </Typography>
                                                        <Typography variant="h6" color={primaryBrand} fontWeight="800" sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                                                            {ref.company}
                                                        </Typography>
                                                    </Box>
                                                    <Avatar sx={{ bgcolor: `${primaryBrand}15`, color: primaryBrand, width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 } }}>
                                                        <CheckCircleOutline />
                                                    </Avatar>
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary" mb={3} sx={{ lineHeight: 1.7, fontWeight: 500, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                                                    Great news! You have been officially referred for this position.
                                                </Typography>

                                                <Paper elevation={0} sx={{
                                                    p: { xs: 1.5, md: 2 },
                                                    borderRadius: { xs: '12px', md: '16px' },
                                                    bgcolor: '#f8fafc',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5
                                                }}>
                                                    <Avatar sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 }, bgcolor: deepZinc, fontSize: '0.7rem' }}>
                                                        ✓
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}>
                                                            REFERRAL STATUS
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="800" color="#10b981" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                                            Successfully Referred
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}
                </Container>

                {/* Referral Dialog */}
                <Dialog
                    open={referralOpen}
                    onClose={() => setReferralOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: { xs: '20px', md: '32px' },
                            p: { xs: 1.5, md: 2 }
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.75rem' }, letterSpacing: -1 }}>
                        Request a Referral
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Typography variant="body1" color="text.secondary" mb={3} sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            Explain why you're interested in <strong>{selectedJob?.title}</strong> at <strong>{selectedJob?.company}</strong>.
                        </Typography>
                        <Stack spacing={3}>
                            <TextField
                                label="Personal Message"
                                placeholder="Highlight your relevant skills..."
                                fullWidth
                                multiline
                                rows={4}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: { xs: '12px', md: '18px' } }
                                }}
                            />
                            <Box sx={{
                                p: { xs: 2, md: 3 },
                                borderRadius: { xs: '16px', md: '20px' },
                                border: '1px dashed #e2e8f0',
                                bgcolor: '#f8fafc'
                            }}>
                                <Typography variant="subtitle2" fontWeight="900" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                                    <Description sx={{ fontSize: { xs: 16, md: 18 } }} /> Your Resume (PDF)
                                </Typography>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setResume(e.target.files[0])}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        fontSize: '0.85rem',
                                        fontFamily: 'inherit',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                                {resume && (
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: primaryBrand, fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
                                        ✓ {resume.name}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2, md: 3 }, pt: 1, gap: 1 }}>
                        <Button
                            onClick={() => setReferralOpen(false)}
                            sx={{
                                textTransform: 'none',
                                color: 'text.secondary',
                                fontWeight: 700,
                                px: 3,
                                fontSize: { xs: '0.85rem', md: '0.9rem' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestReferral}
                            variant="contained"
                            disableElevation
                            sx={{
                                bgcolor: deepZinc,
                                borderRadius: { xs: '12px', md: '16px' },
                                textTransform: 'none',
                                px: { xs: 2, md: 4 },
                                py: { xs: 0.75, md: 1.5 },
                                fontWeight: 800,
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                '&:hover': { bgcolor: '#000' }
                            }}
                        >
                            Send Request
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default JobBoard;