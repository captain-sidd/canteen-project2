/**
 * API Service Module
 * Centralized API calls with error handling and safe data access
 * Handles all backend endpoints with graceful fallbacks
 */

import api from './api';

// Safe response handler
const handleResponse = (response) => {
  if (response && response.data) {
    return response.data;
  }
  return null;
};

// Safe error handler
const handleError = (error, defaultValue = null) => {
  console.error('API Error:', error?.response?.data || error?.message);
  return defaultValue;
};

export const apiService = {
  // ==================== MENU ENDPOINTS ====================
  
  /**
   * Get all menu items with optional filters
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @param {string} search - Search query
   * @param {string} category - Filter by category
   * @returns {Promise<{items: Array, hasMore: boolean, total: number}>}
   */
  getMenuItems: async (page = 1, limit = 20, search = '', category = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category.toLowerCase();
      const response = await api.get('/menu', { params });
      
      console.log("MENU API RESPONSE", response.data);
      
      const data = handleResponse(response);
      if (Array.isArray(data)) {
        return { items: data, hasMore: false, total: data.length };
      }
      return data || { items: [], hasMore: false, total: 0 };
    } catch (error) {
      return handleError(error, { items: [], hasMore: false, total: 0 });
    }
  },

  /**
   * Get trending menu items
   * @returns {Promise<Array>}
   */
  getTrendingMenu: async () => {
    try {
      const response = await api.get('/menu/trending');
      const data = handleResponse(response);
      console.log("TRENDING API RESPONSE", data);
      return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    } catch (error) {
      return handleError(error, []);
    }
  },

  /**
   * Get featured menu items
   * @returns {Promise<Array>}
   */
  getFeaturedMenu: async () => {
    try {
      const response = await api.get('/menu/featured');
      const data = handleResponse(response);
      console.log("FEATURED API RESPONSE", data);
      return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    } catch (error) {
      return handleError(error, []);
    }
  },

  /**
   * Get special/promotional menu items
   * @returns {Promise<Array>}
   */
  getSpecialMenu: async () => {
    try {
      const response = await api.get('/menu/specials');
      const data = handleResponse(response);
      console.log("SPECIALS API RESPONSE", data);
      return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    } catch (error) {
      return handleError(error, []);
    }
  },

  // ==================== COMBO ENDPOINTS ====================

  /**
   * Get all combos with optional filters
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise<{items: Array, hasMore: boolean, total: number}>}
   */
  getCombos: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/combos', { params: { page, limit } });
      return handleResponse(response) || { items: [], hasMore: false, total: 0 };
    } catch (error) {
      return handleError(error, { items: [], hasMore: false, total: 0 });
    }
  },

  /**
   * Get trending combos
   * @returns {Promise<Array>}
   */
  getTrendingCombos: async () => {
    try {
      const response = await api.get('/combos/trending');
      const data = handleResponse(response);
      return Array.isArray(data?.items) ? data.items : data || [];
    } catch (error) {
      return handleError(error, []);
    }
  },

  /**
   * Get featured combos
   * @returns {Promise<Array>}
   */
  getFeaturedCombos: async () => {
    try {
      const response = await api.get('/combos/featured');
      const data = handleResponse(response);
      return Array.isArray(data?.items) ? data.items : data || [];
    } catch (error) {
      return handleError(error, []);
    }
  },

  // ==================== ORDER ENDPOINTS ====================

  /**
   * Get all user orders
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise<{items: Array, hasMore: boolean, total: number}>}
   */
  getOrders: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/orders', { params: { page, limit } });
      return handleResponse(response) || { items: [], hasMore: false, total: 0 };
    } catch (error) {
      return handleError(error, { items: [], hasMore: false, total: 0 });
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>}
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  /**
   * Get order status by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>}
   */
  getOrderStatus: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/status`);
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  /**
   * Update order status (admin only)
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  // ==================== PROFILE ENDPOINTS ====================

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile information
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  // ==================== WALLET ENDPOINTS ====================

  /**
   * Get wallet balance
   * @returns {Promise<Object>}
   */
  getWalletBalance: async () => {
    try {
      const response = await api.get('/wallet');
      return handleResponse(response) || { balance: 0 };
    } catch (error) {
      return handleError(error, { balance: 0 });
    }
  },

  /**
   * Get wallet transaction history
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise<{items: Array, hasMore: boolean, total: number}>}
   */
  getWalletHistory: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/wallet/history', { params: { page, limit } });
      return handleResponse(response) || { items: [], hasMore: false, total: 0 };
    } catch (error) {
      return handleError(error, { items: [], hasMore: false, total: 0 });
    }
  },

  /**
   * Add balance to wallet
   * @param {number} amount - Amount to add
   * @param {string} method - Payment method
   * @returns {Promise<Object>}
   */
  addWalletBalance: async (amount, method = 'card') => {
    try {
      const response = await api.post('/wallet/add', { amount, payment_method: method });
      return handleResponse(response) || {};
    } catch (error) {
      return handleError(error, null);
    }
  },

  // ==================== PAYMENT ENDPOINTS ====================

  /**
   * Process wallet payment
   * @param {Object} payload - Payment details including PIN
   * @returns {Promise<Object>}
   */
  processWalletPayment: async (payload) => {
    try {
      const response = await api.post('/payments/wallet-pay', payload);
      return handleResponse(response);
    } catch (error) {
      // Don't handle silently so UI can show error
      throw error;
    }
  },

  /**
   * Process UPI payment
   * @param {Object} payload - Payment details including UPI ID
   * @returns {Promise<Object>}
   */
  processUpiPayment: async (payload) => {
    try {
      const response = await api.post('/payments/upi-pay', payload);
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // ==================== SEARCH ENDPOINTS ====================

  /**
   * Search for menu items and combos
   * @param {string} query - Search query
   * @returns {Promise<{menuItems: Array, combos: Array}>}
   */
  search: async (query) => {
    try {
      const [menuResponse, comboResponse] = await Promise.all([
        api.get('/menu', { params: { search: query, limit: 10 } }),
        api.get('/combos', { params: { search: query, limit: 10 } }),
      ]);
      return {
        menuItems: handleResponse(menuResponse)?.items || [],
        combos: handleResponse(comboResponse)?.items || [],
      };
    } catch (error) {
      return handleError(error, { menuItems: [], combos: [] });
    }
  },
};

export default apiService;
