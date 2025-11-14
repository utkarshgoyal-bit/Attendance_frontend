// Token management utilities

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isTokenExpired = (token) => {
  // If no token provided, return true (expired)
  if (!token) {
    return true;
  }

  try {
    // JWT structure: header.payload.signature
    // Split by '.' and take the middle part (payload)
    const parts = token.split('.');

    if (parts.length !== 3) {
      return true; // Invalid token format
    }

    // Get the payload (middle part)
    const payload = parts[1];

    // Base64 decode the payload
    // Replace URL-safe characters and decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Parse the JSON payload
    const decoded = JSON.parse(jsonPayload);

    // Check if token has exp field
    if (!decoded.exp) {
      return true; // No expiration field
    }

    // Check if token is expired
    // JWT exp is in seconds, Date.now() is in milliseconds
    const isExpired = decoded.exp * 1000 < Date.now();

    return isExpired;
  } catch (error) {
    // If any error occurs during decoding, consider token as expired
    console.error('Error decoding token:', error);
    return true;
  }
};

// User management utilities

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

// Authentication check

export const isAuthenticated = () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Remove expired token and user data
    removeToken();
    removeUser();
    return false;
  }

  return true;
};

// Logout utility

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

// Get user ID

export const getUserId = () => {
  const user = getUser();
  return user?.id || null;
};

// Get user role

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

// Check if user has specific role

export const hasRole = (...allowedRoles) => {
  const userRole = getUserRole();
  return allowedRoles.includes(userRole);
};
