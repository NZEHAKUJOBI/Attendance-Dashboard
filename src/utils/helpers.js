// Date and time utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString("en-US", defaultOptions);
};

export const formatTime = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return date.toLocaleTimeString("en-US", defaultOptions);
};

export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return date.toLocaleString("en-US", defaultOptions);
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return "Never";

  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Number formatting utilities
export const formatNumber = (number, options = {}) => {
  if (number == null) return "0";
  return new Intl.NumberFormat("en-US", options).format(number);
};

export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return "0%";
  return `${((value / total) * 100).toFixed(decimals)}%`;
};

// Status utilities
export const getDeviceStatus = (isOnline, lastSeen) => {
  if (!isOnline) return { status: "offline", color: "red", text: "Offline" };

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMinutes = (now - lastSeenDate) / (1000 * 60);

  if (diffMinutes < 5)
    return { status: "online", color: "green", text: "Online" };
  if (diffMinutes < 30)
    return { status: "warning", color: "yellow", text: "Warning" };
  return { status: "offline", color: "red", text: "Offline" };
};

export const getSuccessRateStatus = (successRate) => {
  if (successRate >= 90)
    return { status: "excellent", color: "green", text: "Excellent" };
  if (successRate >= 70)
    return { status: "good", color: "yellow", text: "Good" };
  if (successRate >= 50)
    return { status: "poor", color: "orange", text: "Poor" };
  return { status: "critical", color: "red", text: "Critical" };
};

// Data processing utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = "asc") => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (direction === "desc") {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    }
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  });
};

export const filterBy = (array, filters) => {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true;
      return item[key] === value;
    });
  });
};

// Validation utilities
export const isValidGuid = (guid) => {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Color utilities for charts
export const getChartColors = (count) => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
  ];

  if (count <= colors.length) {
    return colors.slice(0, count);
  }

  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return [...colors, ...additionalColors];
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// Export all utilities
export default {
  formatDate,
  formatTime,
  formatDateTime,
  getTimeAgo,
  formatNumber,
  formatPercentage,
  getDeviceStatus,
  getSuccessRateStatus,
  groupBy,
  sortBy,
  filterBy,
  isValidGuid,
  isValidEmail,
  isValidPhoneNumber,
  getChartColors,
  storage,
};
