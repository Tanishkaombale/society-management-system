import api from './axios';

// Auth
export const login = (data) => api.post('/auth/login', data);
export const registerSociety = (data) => api.post('/auth/register/society', data);
export const registerJoinRequest = (data) => api.post('/auth/register/join', data);
export const lookupSocietyByCode = (code) => api.get(`/auth/society-lookup/${code}`);
export const googleAuth = (data) => api.post('/auth/google', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);

// Society
export const getMySociety = () => api.get('/societies/me');
export const updateMySociety = (data) => api.put('/societies/me', data);

// Dashboard
export const getStats = () => api.get('/dashboard/stats');

// Users
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const approveUser = (id) => api.put(`/users/${id}/approve`);
export const assignFlat = (id, flatId) => api.put(`/users/${id}/assign-flat`, { flatId });

// Flats
export const getFlats = (params) => api.get('/flats', { params });
export const getFlat = (id) => api.get(`/flats/${id}`);
export const createFlat = (data) => api.post('/flats', data);
export const updateFlat = (id, data) => api.put(`/flats/${id}`, data);
export const deleteFlat = (id) => api.delete(`/flats/${id}`);

// Notices
export const getNotices = (params) => api.get('/notices', { params });
export const createNotice = (data) => api.post('/notices', data);
export const updateNotice = (id, data) => api.put(`/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);

// Complaints
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);
export const addComplaintComment = (id, text) => api.post(`/complaints/${id}/comments`, { text });
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);

// Visitors
export const getVisitors = (params) => api.get('/visitors', { params });
export const createVisitor = (data) => api.post('/visitors', data);
export const checkoutVisitor = (id) => api.put(`/visitors/${id}/checkout`);
export const updateVisitor = (id, data) => api.put(`/visitors/${id}`, data);
export const deleteVisitor = (id) => api.delete(`/visitors/${id}`);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const createPayment = (data) => api.post('/payments', data);
export const markPaymentPaid = (id, paymentMethod) => api.put(`/payments/${id}/pay`, { paymentMethod });
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Amenities
export const getAmenities = () => api.get('/amenities');
export const createAmenity = (data) => api.post('/amenities', data);
export const updateAmenity = (id, data) => api.put(`/amenities/${id}`, data);
export const deleteAmenity = (id) => api.delete(`/amenities/${id}`);

// Bookings
export const getBookings = (params) => api.get('/bookings', { params });
export const createBooking = (data) => api.post('/bookings', data);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
