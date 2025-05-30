// API utility functions for frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new ApiError(errorData.message || 'Request failed', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

// Auth API functions
export const authApi = {
  // Check authentication status
  checkAuthStatus: () => apiRequest('/api/auth/status'),
  
  // Initiate Google OAuth
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },
  
  // Logout user
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
};

// Calendar API functions
export const calendarApi = {
  // Fetch calendar data
  fetchCalendarData: () => apiRequest('/api/calendar/fetch'),
  
  // Get calendar list
  getCalendars: () => apiRequest('/api/calendar/list'),
};

// Analysis API functions
export const analysisApi = {
  // Analyze calendar data
  analyzeCalendar: (calendarData) => 
    apiRequest('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ calendarData }),
    }),
  
  // Get analysis history
  getAnalysisHistory: () => apiRequest('/api/analysis/history'),
  
  // Save analysis results
  saveAnalysis: (analysisData) =>
    apiRequest('/api/analysis/save', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    }),
};

// Utility functions
export const utils = {
  // Format date for API
  formatDateForApi: (date) => {
    return date.toISOString();
  },
  
  // Parse API date
  parseApiDate: (dateString) => {
    return new Date(dateString);
  },
  
  // Handle API errors
  handleApiError: (error, setError) => {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      setError('Please log in again');
      // Optionally redirect to login
    } else if (error.status === 403) {
      setError('You don\'t have permission to access this resource');
    } else if (error.status === 429) {
      setError('Too many requests. Please try again later');
    } else if (error.status === 0) {
      setError('Network error. Please check your connection');
    } else {
      setError(error.message || 'Something went wrong');
    }
  },
};

// React hook for API calls
export function useApi() {
  return {
    authApi,
    calendarApi,
    analysisApi,
    utils,
  };
}