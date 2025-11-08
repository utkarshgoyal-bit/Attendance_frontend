/**
 * Cache Service using sessionStorage
 * Provides caching with TTL (Time To Live) support
 */

/**
 * Set data in cache with expiry time
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export const setCache = (key, data, ttl) => {
  try {
    const cacheData = {
      data: data,
      expiry: Date.now() + ttl,
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`Cache set: ${key} (TTL: ${ttl}ms)`);
  } catch (error) {
    console.error('Error setting cache:', error.message);
    // Handle quota exceeded or other storage errors gracefully
  }
};

/**
 * Get data from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCache = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) {
      return null;
    }

    const cacheData = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > cacheData.expiry) {
      console.log(`Cache expired: ${key}`);
      sessionStorage.removeItem(key);
      return null;
    }

    console.log(`Cache hit: ${key}`);
    return cacheData.data;
  } catch (error) {
    console.error('Error getting cache:', error.message);
    return null;
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key
 */
export const clearCache = (key) => {
  try {
    sessionStorage.removeItem(key);
    console.log(`Cache cleared: ${key}`);
  } catch (error) {
    console.error('Error clearing cache:', error.message);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  try {
    sessionStorage.clear();
    console.log('All cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error.message);
  }
};
