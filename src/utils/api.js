import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 🔥 Increased from 10s to 30s for email operations
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Only redirect to login if not currently on the login endpoint
      const isLoginRequest = error.config.url.includes('/auth/login');
      
      if (error.response.status === 401 && !isLoginRequest) {
        // Token expired or invalid (but not for login requests)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 403 && !isLoginRequest) {
        // Forbidden access - could be due to role or permission issues or token invalid
        console.warn('Access forbidden for this API endpoint:', error.config.url);
        // If the 403 is due to token issues, redirect to login (but not for login requests)
        const errMsg = error.response.data?.error || '';
        if (
          errMsg.includes('Invalid') ||
          errMsg.includes('expired') ||
          errMsg.includes('token')
        ) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Auth endpoints
  login: (email, password) => {
    console.log('Making login API call with:', { email, password: '***hidden***' }); // Debug log
    return api.post('/auth/login', { email, password });
  },
  register: (userData) => api.post('/auth/register', userData),
  getUserInfo: () => api.get('/auth/me'), // Get current user info
  getChatUsers: () => api.get('/chat/users'),

  // User endpoints
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUserStatus: (id, statusData) => api.patch(`/users/${id}/status`, statusData),
  resetUserPassword: (id, passwordData) => api.patch(`/users/reset-password/${id}`, passwordData),

  // Student check-exists (live uniqueness validation)
  checkStudentExists: (field, value, excludeId = null) => {
    const params = `field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
    return api.get(`/students/check-exists?${params}`);
  },

  // Student endpoints
  getStudents: (filters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.batchId) params.append('batchId', filters.batchId);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    return api.get(`/students${queryString ? '?' + queryString : ''}`);
  },
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),

  // Course endpoints
  getCourses: () => api.get('/courses'),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // Batch endpoints
  getBatches: () => api.get('/batches'),
  createBatch: (batchData) => api.post('/batches', batchData),
  updateBatch: (id, batchData) => api.put(`/batches/${id}`, batchData),
  deleteBatch: (id) => api.delete(`/batches/${id}`),

  // Live Class endpoints
  getLiveClasses: () => api.get('/live-classes'),
  getLiveClassByBatch: (batchId) => api.get(`/live-classes/batch/${batchId}`),
  createLiveClass: (liveClassData) => api.post('/live-classes', liveClassData),
  updateLiveClass: (id, liveClassData) => api.put(`/live-classes/${id}`, liveClassData),
  deleteLiveClass: (id) => api.delete(`/live-classes/${id}`),

  // Chat endpoints
  getChatGroups: () => api.get('/chat'),
  createChatGroup: (groupData) => api.post('/chat/create-group', groupData),
  getDirectMessagePartners: () => api.get('/chat/dm/partners'),
  createDirectMessage: (recipientId) => api.post('/chat/dm', { recipientId }),
  getGroupMessages: (groupId) => api.get(`/chat/group/${groupId}/messages`),
  sendMessage: (messageData) => api.post('/chat/send', messageData),

  // Expense endpoints
  getExpenses: () => api.get('/expenses'),
  createExpense: (expenseData) => api.post('/expenses', expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),

  // Payment endpoints
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getPaymentsByStudent: (studentId) => api.get(`/payments/student/${studentId}`),
  getAllPayments: () => api.get('/payments'),
  getPaymentByReceipt: (receiptNo) => api.get(`/payments/receipt/${receiptNo}`),
  getRemainingBalance: (studentId) => api.get(`/payments/balance/${studentId}`),
  // 🔥 NEW: Recovery alerts and pending fees
  getRecoveryAlerts: () => api.get('/payments/alerts/recovery'),
  getPendingFeesSummary: () => api.get('/payments/summary/pending-fees'),

  // Settings endpoints
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsData) => api.put('/settings', settingsData),

  // Stats endpoints
  getFinancialDashboardStats: () => api.get('/stats/financial-dashboard'),

  // Reports endpoints
  getReports: (startDate, endDate, batchId) => {
    let url = `/reports?startDate=${startDate}&endDate=${endDate}`;
    if (batchId && batchId !== 'all') {
      url += `&batchId=${batchId}`;
    }
    return api.get(url);
  },

  // Live Class endpoints for students
  getStudentLiveSession: () => api.get('/live-classes/student/session'),

  // ============ ENROLLMENT ENDPOINTS ============
  createEnrollment: (data) => api.post('/enrollments', data),
  getEnrollmentsByStudent: (studentId) => api.get(`/enrollments/student/${studentId}`),
  updateEnrollment: (id, data) => api.patch(`/enrollments/${id}`, data),
  deleteEnrollment: (id) => api.delete(`/enrollments/${id}`)
};

export default apiClient;