/**
 * Utility functions for safe data access
 * Provides null-safe access to object properties with defaults
 */

/**
 * Safely access nested properties with optional chaining
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-separated path to property (e.g., "user.profile.name")
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or defaultValue
 */
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current?.[key] === undefined) return defaultValue;
      current = current[key];
    }
    
    return current !== null && current !== undefined ? current : defaultValue;
  } catch (error) {
    console.warn(`Error accessing path "${path}":`, error);
    return defaultValue;
  }
};

/**
 * Format price with currency symbol
 * @param {number|string} price - Price value
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = '₹') => {
  try {
    const num = parseFloat(price);
    return !isNaN(num) ? `${currency}${num.toFixed(2)}` : `${currency}0.00`;
  } catch {
    return `${currency}0.00`;
  }
};

/**
 * Get safe image URI with fallback
 * @param {string} imageUrl - Image URL
 * @param {string} fallback - Fallback image URL
 * @returns {string} Valid image URL
 */
export const getSafeImageUri = (
  imageUrl, 
  fallback = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'
) => {
  if (!imageUrl || typeof imageUrl !== 'string') return fallback;
  return imageUrl.trim() || fallback;
};

/**
 * Safely get array with fallback
 * @param {*} value - Value to check
 * @param {Array} defaultValue - Default array
 * @returns {Array} Array or default
 */
export const safeArray = (value, defaultValue = []) => {
  return Array.isArray(value) ? value : defaultValue;
};

/**
 * Format date string to readable format
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, format = 'short') => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'time':
        return date.toLocaleTimeString();
      default:
        return date.toString();
    }
  } catch {
    return 'Invalid date';
  }
};

/**
 * Get rating display with validation
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum rating (default: 5)
 * @returns {number} Valid rating
 */
export const getSafeRating = (rating, maxRating = 5) => {
  const num = parseFloat(rating);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, maxRating);
};

/**
 * Create star rating component data
 * @param {number} rating - Rating value
 * @param {number} maxStars - Maximum stars (default: 5)
 * @returns {Object} {fullStars, halfStar, emptyStars}
 */
export const getStarRating = (rating, maxStars = 5) => {
  const safeRating = getSafeRating(rating, maxStars);
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;
  
  return { fullStars, halfStar, emptyStars, rating: safeRating };
};

/**
 * Get discount percentage from prices
 * @param {number} originalPrice - Original price
 * @param {number} discountPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const getDiscountPercentage = (originalPrice, discountPrice) => {
  const orig = parseFloat(originalPrice);
  const disc = parseFloat(discountPrice);
  
  if (isNaN(orig) || isNaN(disc) || orig === 0 || disc > orig) return 0;
  
  return Math.round(((orig - disc) / orig) * 100);
};

/**
 * Get badge for special items
 * @param {Object} item - Item object
 * @returns {string|null} Badge text or null
 */
export const getItemBadge = (item) => {
  if (!item || typeof item !== 'object') return null;
  
  if (item.is_featured) return 'Featured';
  if (safeGet(item, 'discount_price') && parseFloat(item.price) > parseFloat(item.discount_price)) {
    return `${getDiscountPercentage(item.price, item.discount_price)}% OFF`;
  }
  if (safeGet(item, 'is_veg')) return 'Veg';
  if (item.rating && parseFloat(item.rating) >= 4.5) return '⭐ Top Rated';
  
  return null;
};

/**
 * Safe menu item normalization with defaults
 * @param {Object} item - Menu item from API
 * @returns {Object} Normalized item with all safe defaults
 */
export const normalizeMenuItem = (item) => {
  if (!item || typeof item !== 'object') return null;
  
  return {
    id: safeGet(item, 'id') || safeGet(item, '_id'),
    name: safeGet(item, 'name', 'Unknown Item'),
    description: safeGet(item, 'description', ''),
    price: parseFloat(safeGet(item, 'price', 0)) || 0,
    discount_price: parseFloat(safeGet(item, 'discount_price')) || null,
    image_url: getSafeImageUri(safeGet(item, 'image_url')),
    gallery_images: safeArray(safeGet(item, 'gallery_images')),
    category: safeGet(item, 'category', 'General'),
    is_available: safeGet(item, 'is_available', true) !== false,
    is_veg: safeGet(item, 'is_veg', false) === true,
    is_featured: safeGet(item, 'is_featured', false) === true,
    rating: getSafeRating(safeGet(item, 'rating')),
    tags: safeArray(safeGet(item, 'tags')),
    ingredients: safeArray(safeGet(item, 'ingredients')),
    allergens: safeArray(safeGet(item, 'allergens')),
  };
};

/**
 * Safe combo normalization with defaults
 * @param {Object} item - Combo from API
 * @returns {Object} Normalized combo
 */
export const normalizeCombo = (item) => {
  if (!item || typeof item !== 'object') return null;
  
  return {
    id: safeGet(item, 'id') || safeGet(item, '_id'),
    name: safeGet(item, 'name', 'Unknown Combo'),
    description: safeGet(item, 'description', ''),
    original_price: parseFloat(safeGet(item, 'original_price', 0)) || 0,
    discounted_price: parseFloat(safeGet(item, 'discounted_price')) || null,
    image_url: getSafeImageUri(safeGet(item, 'image_url')),
    gallery_images: safeArray(safeGet(item, 'gallery_images')),
    is_featured: safeGet(item, 'is_featured', false) === true,
    rating: getSafeRating(safeGet(item, 'rating')),
    tags: safeArray(safeGet(item, 'tags')),
    items: safeArray(safeGet(item, 'items')),
  };
};

/**
 * Safe order normalization
 * @param {Object} order - Order from API
 * @returns {Object} Normalized order
 */
export const normalizeOrder = (order) => {
  if (!order || typeof order !== 'object') return null;
  
  return {
    id: safeGet(order, 'id') || safeGet(order, '_id'),
    order_number: safeGet(order, 'order_number', '#0000'),
    status: safeGet(order, 'status', 'pending'),
    total_amount: parseFloat(safeGet(order, 'total_amount', 0)) || 0,
    items: safeArray(safeGet(order, 'items')),
    created_at: safeGet(order, 'created_at'),
    estimated_time: safeGet(order, 'estimated_time'),
  };
};

/**
 * Get status badge color
 * @param {string} status - Order status
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const statusMap = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    preparing: '#9C27B0',
    ready: '#4CAF50',
    completed: '#388E3C',
    cancelled: '#F44336',
  };
  return statusMap[status?.toLowerCase?.()] || '#757575';
};

/**
 * Get status display text
 * @param {string} status - Order status
 * @returns {string} Display text
 */
export const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    preparing: 'Being Prepared',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status?.toLowerCase?.()] || status || 'Unknown';
};

export default {
  safeGet,
  formatPrice,
  getSafeImageUri,
  safeArray,
  formatDate,
  getSafeRating,
  getStarRating,
  getDiscountPercentage,
  getItemBadge,
  normalizeMenuItem,
  normalizeCombo,
  normalizeOrder,
  getStatusColor,
  getStatusText,
};
