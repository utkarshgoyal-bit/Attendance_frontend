import apiClient from './apiClient';
import { getCache, setCache, clearCache } from './cacheService';

export const fetchSalaryConfig = async () => {
  try {
    // Check cache first
    const cachedConfig = getCache('salaryConfig');
    if (cachedConfig) {
      console.log('Returning cached salary config');
      return cachedConfig;
    }

    // If not cached, fetch from API
    const response = await apiClient.get('/salary-config');

    // Cache for 1 hour (3600000 ms)
    setCache('salaryConfig', response.data, 3600000);

    return response.data;
  } catch (error) {
    console.error("Error fetching salary config:", error);
    throw error;
  }
};

export const updateSalaryConfig = async (payload) => {
  try {
    const response = await apiClient.put('/salary-config', payload);

    // Clear cache after updating
    clearCache('salaryConfig');

    return response.data;
  } catch (error) {
    console.error("Error updating salary config:", error);
    throw error;
  }
};
