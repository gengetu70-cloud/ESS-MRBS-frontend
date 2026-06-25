// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

// Format time to readable string
export const formatTime = (time) => {
  if (!time) return 'N/A';
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return 'N/A';
  }
};

// Format date and time
export const formatDateTime = (date, time) => {
  if (!date && !time) return 'N/A';
  return `${formatDate(date)} at ${formatTime(time)}`;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  try {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  } catch {
    return 'U';
  }
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Check if string is valid JSON
export const isValidJson = (str) => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// FIXED: Get status color - added more statuses and better handling
export const getStatusColor = (status) => {
  if (!status) return 'default';
  const normalizedStatus = status.toLowerCase();
  const colors = {
    available: 'success',
    booked: 'warning',
    maintenance: 'error',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'error',
    canceled: 'error', // Added for US spelling
    completed: 'info',
    active: 'success',
    inactive: 'default',
    disabled: 'error',
    confirmed: 'success',
    scheduled: 'info',
    in_progress: 'warning',
    finished: 'info',
    archived: 'default',
  };
  return colors[normalizedStatus] || 'default';
};

// FIXED: Calculate duration between two times with better error handling
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '0h 0m';
  try {
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    
    // Validate parts
    if (startParts.some(isNaN) || endParts.some(isNaN)) {
      return '0h 0m';
    }
    
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const duration = endMinutes - startMinutes;
    
    // Handle negative duration (end before start)
    if (duration < 0) return '0h 0m';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return '0h 0m';
  }
};

// FIXED: Calculate duration between two dates (for date objects)
export const calculateDurationInMinutes = (startDateTime, endDateTime) => {
  if (!startDateTime || !endDateTime) return 0;
  try {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60));
  } catch {
    return 0;
  }
};

// FIXED: Format duration in hours and minutes
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Group array by key with better error handling
export const groupBy = (array, key) => {
  if (!Array.isArray(array) || !key) return {};
  try {
    return array.reduce((result, item) => {
      const groupKey = item?.[key] ?? 'undefined';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  } catch {
    return {};
  }
};

// Sort array by date with better error handling
export const sortByDate = (array, key = 'createdAt') => {
  if (!Array.isArray(array)) return [];
  try {
    return [...array].sort((a, b) => {
      const dateA = new Date(a?.[key]);
      const dateB = new Date(b?.[key]);
      return dateB.getTime() - dateA.getTime();
    });
  } catch {
    return array;
  }
};

// NEW: Sort array by date ascending (oldest first)
export const sortByDateAscending = (array, key = 'createdAt') => {
  if (!Array.isArray(array)) return [];
  try {
    return [...array].sort((a, b) => {
      const dateA = new Date(a?.[key]);
      const dateB = new Date(b?.[key]);
      return dateA.getTime() - dateB.getTime();
    });
  } catch {
    return array;
  }
};

// NEW: Check if a date is today
export const isToday = (date) => {
  if (!date) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  } catch {
    return false;
  }
};

// NEW: Check if a date is in the future
export const isFutureDate = (date) => {
  if (!date) return false;
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() > now.getTime();
  } catch {
    return false;
  }
};

// NEW: Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
  } catch {
    return 'N/A';
  }
};

// NEW: Format currency (if needed)
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
};

// NEW: Sanitize string (remove special characters)
export const sanitizeString = (str) => {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};