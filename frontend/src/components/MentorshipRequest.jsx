import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  History,
  InfoOutlined,
  CancelOutlined,
  CheckCircleOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Launch,
  HourglassEmpty,
  Block
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SNavbar from './SNavbar';
import { getMentorshipRequests, cancelMentorshipRequest } from '../api';

const MentorshipRequests = () => {
  const navigate = useNavigate();
  const [openRequest, setOpenRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Branding Colors
  const primaryBrand = '#6366f1';
  const deepZinc = '#09090b';
  const mutedZinc = '#71717a';
  const glassBorder = '#e4e4e7';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getMentorshipRequests();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await cancelMentorshipRequest(id);
      setRequests(prev => prev.map(req =>
        req.id === id ? { ...req, status: 'cancelled' } : req
      ));
      alert("Request cancelled.");
    } catch (error) {
      console.error("Cancel failed", error);
      alert("Failed to cancel request.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircleOutline sx={{ fontSize: 16 }} /> };
      case 'pending': return { color: '#f59e0b', bg: '#fffbeb', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> };
      case 'rejected': return { color: '#ef4444', bg: '#fef2f2', icon: <Block sx={{ fontSize: 16 }} /> };
      case 'cancelled': return { color: '#71717a', bg: '#f4f4f5', icon: <CancelOutlined sx={{ fontSize: 16 }} /> };
      default: return { color: '#71717a', bg: '#f4f4f5' };
    }
  };



  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pt: 12, pb: 8 }}>
      <SNavbar />
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Avatar sx={{ bgcolor: `${primaryBrand}10`, color: primaryBrand }}>
              <History />
            </Avatar>
            <Typography variant="h4" fontWeight="900" sx={{ color: deepZinc, letterSpacing: '-1px' }}>
              Mentorship Requests
            </Typography>
          </Stack>
          <Typography variant="body1" color={mutedZinc}>
            Track the status of your mentorship invitations and manage active requests.
          </Typography>
        </Box>

        {/* Requests Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: `1px solid ${glassBorder}`, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: mutedZinc }}>ALUMNI</TableCell>
                <TableCell sx={{ fontWeight: 800, color: mutedZinc }}>TYPES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: mutedZinc }}>REQUESTED ON</TableCell>
                <TableCell sx={{ fontWeight: 800, color: mutedZinc }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: mutedZinc }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => {
                const isOpen = openRequest === request.id;
                const style = getStatusStyle(request.status);
                return (
                  <React.Fragment key={request.id}>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell sx={{ py: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconButton size="small" onClick={() => setOpenRequest(isOpen ? null : request.id)}>
                            {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                          <Box>
                            <Typography variant="body2" fontWeight="800" color={deepZinc}>{request.alumni_full_name}</Typography>
                            <Typography variant="caption" color={mutedZinc}>{request.alumni_role} • {request.alumni_company}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {request.mentorship_types_details?.map(t => (
                            <Chip key={t.id} label={t.name} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20 }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: mutedZinc }}>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          icon={style.icon}
                          sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {request.status?.toLowerCase() === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            variant="text"
                            onClick={() => handleCancelRequest(request.id)}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Cancel
                          </Button>
                        )}
                        {request.status?.toLowerCase() === 'accepted' && (
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<Launch />}
                            onClick={() => navigate('/mymentors')}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '12px', mb: 2 }}>
                            <Typography variant="caption" fontWeight="800" color={mutedZinc} sx={{ mb: 1, display: 'block' }}>
                              YOUR MESSAGE
                            </Typography>
                            <Typography variant="body2" color={deepZinc} sx={{ fontStyle: 'italic' }}>
                              "{request.message}"
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Guidance Note */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 4, p: 3, borderRadius: '16px', bgcolor: 'rgba(99, 102, 241, 0.05)', border: `1px dashed ${primaryBrand}30` }}>
          <InfoOutlined sx={{ color: primaryBrand, fontSize: 20 }} />
          <Typography variant="caption" color={mutedZinc} sx={{ lineHeight: 1.6 }}>
            Alumni usually respond within 3-5 business days. You can cancel a pending request if you've found another mentor or wish to change your request details. Accepted requests will automatically appear in your "My Mentors" section.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default MentorshipRequests;