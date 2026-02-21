import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Token ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// EVENTS
export const getEvents = async () => {
    const response = await api.get('events/');
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await api.post('events/', eventData);
    return response.data;
};

export const registerEvent = async (id) => {
    const response = await api.post(`events/${id}/register/`);
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await api.delete(`events/${id}/`);
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    const response = await api.put(`events/${id}/`, eventData);
    return response.data;
};

export const getAlumni = async () => {
    const response = await api.get('alumni/');
    return response.data;
};

export const getAlumniProfile = async (id) => {
    const response = await api.get(`alumni/${id}/`);
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('profile/update/', profileData);
    return response.data;
};

export const getMentorshipTypes = async () => {
    const response = await api.get('mentorship-types/');
    return response.data;
};

export const getMentorshipRequests = async () => {
    const response = await api.get('mentorship-requests/');
    return response.data;
};

export const createMentorshipRequest = async (requestData) => {
    const response = await api.post('mentorship-requests/', requestData);
    return response.data;
};

export const acceptMentorshipRequest = async (id) => {
    const response = await api.post(`mentorship-requests/${id}/accept/`);
    return response.data;
};

export const rejectMentorshipRequest = async (id) => {
    const response = await api.post(`mentorship-requests/${id}/reject/`);
    return response.data;
};

export const cancelMentorshipRequest = async (id) => {
    const response = await api.post(`mentorship-requests/${id}/cancel/`);
    return response.data;
};

export const getMentorshipActivities = async (requestId) => {
    const url = requestId ? `mentorship-activities/?request_id=${requestId}` : 'mentorship-activities/';
    const response = await api.get(url);
    return response.data;
};

export const createMentorshipActivity = async (activityData) => {
    const headers = activityData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('mentorship-activities/', activityData, { headers });
    return response.data;
};

export const updateMentorshipActivity = async (id, activityData) => {
    const headers = activityData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.patch(`mentorship-activities/${id}/`, activityData, { headers });
    return response.data;
};

export const deleteMentorshipActivity = async (id) => {
    const response = await api.delete(`mentorship-activities/${id}/`);
    return response.data;
};

// Jobs
export const getJobs = async (params = {}) => {
    const response = await api.get('jobs/', { params });
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await api.post('jobs/', jobData);
    return response.data;
};

export const updateJob = async (id, jobData) => {
    const response = await api.patch(`jobs/${id}/`, jobData);
    return response.data;
};

export const deleteJob = async (id) => {
    const response = await api.delete(`jobs/${id}/`);
    return response.data;
};

// Referrals
export const getReferrals = async () => {
    const response = await api.get('referrals/');
    return response.data;
};

export const createReferral = async (referralData) => {
    const headers = referralData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('referrals/', referralData, { headers });
    return response.data;
};

export const updateReferral = async (id, referralData) => {
    const response = await api.patch(`referrals/${id}/`, referralData);
    return response.data;
};

export default api;
