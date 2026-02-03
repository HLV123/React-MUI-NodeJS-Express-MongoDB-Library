const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Saparethere Library',
  
  // Pagination defaults
  defaultPageSize: 12,
  
  // Borrow settings
  maxBooksPerUser: 5,
  borrowDurationDays: 14,
  
  // Local storage keys
  storageKeys: {
    token: 'saparethere_token',
    refreshToken: 'saparethere_refresh_token',
    user: 'saparethere_user',
  },
};

export default config;
