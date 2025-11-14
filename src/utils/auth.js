// Token management
export const setToken = (token) => {
  localStorage.setItem('token', token);
  console.log('✅ Token saved:', token ? 'Yes' : 'No');
};

export const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('📤 Getting token:', token ? 'Found' : 'Not found');
  return token;
};

export const removeToken = () => {
  localStorage.removeItem('token');
  console.log('🗑️ Token removed');
};

// User management
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  console.log('✅ User saved:', user);
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  console.log('📤 Getting user:', user ? 'Found' : 'Not found');
  return user;
};

export const removeUser = () => {
  localStorage.removeItem('user');
  console.log('🗑️ User removed');
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expired = payload.exp * 1000 < Date.now();
    console.log('🕐 Token expired:', expired);
    return expired;
  } catch (error) {
    console.error('❌ Error checking token expiry:', error);
    return true;
  }
};
