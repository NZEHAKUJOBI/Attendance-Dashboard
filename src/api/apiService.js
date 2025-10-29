import api from "./axios";

// Reports API
export const reportsAPI = {
  // Get facility summary
  getFacilitySummary: () => api.get("/reports/facility-summary"),

  // Get facility monthly report
  getFacilityReport: (facility, year, month) =>
    api.get(
      `/reports/facility/${encodeURIComponent(facility)}/${year}/${month}`
    ),

  // Get user timesheet
  getUserTimesheet: (userId, year, month) =>
    api.get(`/reports/timesheet/${userId}/${year}/${month}`),

  // Download user timesheet PDF
  getUserTimesheetPDF: (userId, year, month) =>
    api.get(`/reports/timesheet-pdf/${userId}/${year}/${month}`, {
      responseType: "blob",
    }),

  // Get analytics data
  getAnalytics: (year, month) => api.get(`/reports/analytics/${year}/${month}`),

  // Submit attendance reports
  submitReports: (reportData) => api.post("/reports/receive", reportData),
};

// Device Health API
export const healthAPI = {
  // Get all device statuses
  getDeviceStatus: () => api.get("/health/status"),

  // Send device ping
  pingDevice: (deviceData) => api.post("/health/ping", deviceData),
};

// User API
export const userAPI = {
  // Sync users
  syncUsers: (users) => api.post("/users/sync", users),
};

// Auth API (if you have auth endpoints)
export const authAPI = {
  // Login
  login: (credentials) => api.post("/auth/login", credentials),

  // Register
  register: (userData) => api.post("/auth/register", userData),

  // Refresh token
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),

  // Logout
  logout: () => api.post("/auth/logout"),
};

// Combined export for convenience
const apiService = {
  reports: reportsAPI,
  health: healthAPI,
  user: userAPI,
  auth: authAPI,
};

export default apiService;
