/**
 * Custom hooks for data fetching with error handling
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

/**
 * Hook for fetching data with loading and error states
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} dependencies - Dependencies to trigger refetch
 * @param {*} initialData - Initial data value
 * @returns {Object} {data, loading, error, refetch}
 */
export const useFetch = (fetchFn, dependencies = [], initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, dependencies);

  return { data, loading, error, refetch: fetch };
};

/**
 * Hook for fetching menu items with search and filter support
 * @param {string} searchQuery - Search query
 * @param {string} category - Category filter
 * @param {number} page - Page number
 * @returns {Object} {items, loading, error, hasMore, refetch}
 */
export const useMenuItems = (searchQuery = '', category = '', page = 1) => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const result = await apiService.getMenuItems(page, 20, searchQuery, category);
      return result;
    },
    [searchQuery, category, page],
    { items: [], hasMore: false, total: 0 }
  );

  return {
    items: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching trending items
 * @returns {Object} {items, loading, error, refetch}
 */
export const useTrendingItems = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const items = await apiService.getTrendingMenu();
      return items;
    },
    [],
    []
  );

  return {
    items: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching featured items
 * @returns {Object} {items, loading, error, refetch}
 */
export const useFeaturedItems = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const items = await apiService.getFeaturedMenu();
      return items;
    },
    [],
    []
  );

  return {
    items: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching specials
 * @returns {Object} {items, loading, error, refetch}
 */
export const useSpecials = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const items = await apiService.getSpecialMenu();
      return items;
    },
    [],
    []
  );

  return {
    items: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching combos
 * @param {number} page - Page number
 * @returns {Object} {items, loading, error, hasMore, refetch}
 */
export const useCombos = (page = 1) => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      return await apiService.getCombos(page, 20);
    },
    [page],
    { items: [], hasMore: false, total: 0 }
  );

  return {
    items: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching featured combos
 * @returns {Object} {items, loading, error, refetch}
 */
export const useFeaturedCombos = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const items = await apiService.getFeaturedCombos();
      return items;
    },
    [],
    []
  );

  return {
    items: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching orders
 * @param {number} page - Page number
 * @returns {Object} {orders, loading, error, hasMore, refetch}
 */
export const useOrders = (page = 1) => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      return await apiService.getOrders(page, 20);
    },
    [page],
    { items: [], hasMore: false, total: 0 }
  );

  return {
    orders: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching user profile
 * @returns {Object} {profile, loading, error, refetch}
 */
export const useProfile = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      return await apiService.getProfile();
    },
    [],
    {}
  );

  return {
    profile: data || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching wallet balance
 * @returns {Object} {balance, loading, error, refetch}
 */
export const useWalletBalance = () => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const result = await apiService.getWalletBalance();
      return result?.balance || 0;
    },
    [],
    0
  );

  return {
    balance: data || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching wallet history
 * @param {number} page - Page number
 * @returns {Object} {transactions, loading, error, hasMore, refetch}
 */
export const useWalletHistory = (page = 1) => {
  const { data, loading, error, refetch } = useFetch(
    async () => {
      return await apiService.getWalletHistory(page, 20);
    },
    [page],
    { items: [], hasMore: false, total: 0 }
  );

  return {
    transactions: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch,
  };
};

export default {
  useFetch,
  useMenuItems,
  useTrendingItems,
  useFeaturedItems,
  useSpecials,
  useCombos,
  useFeaturedCombos,
  useOrders,
  useProfile,
  useWalletBalance,
  useWalletHistory,
};
