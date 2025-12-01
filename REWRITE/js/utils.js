/**
 * VeriScript - Utility Functions
 * Comprehensive helper functions for the application
 */

const utils = {
  
  /**
   * ============================================
   * AUTHENTICATION
   * ============================================
   */
  
  /**
   * Check if user is authenticated
   * @param {string} redirectUrl - URL to redirect if not authenticated
   * @returns {Promise<Object>} - User object
   */
  checkAuth: async function(redirectUrl = '/') {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
          reject('Not authenticated');
        }
      });
    });
  },
  
  /**
   * Get current user
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser: function() {
    return firebase.auth().currentUser;
  },
  
  /**
   * Logout user
   */
  logout: async function() {
    try {
      await firebase.auth().signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      this.showToast('Error logging out', 'error');
    }
  },
  
  /**
   * ============================================
   * FIRESTORE HELPERS
   * ============================================
   */
  
  /**
   * Get document from Firestore
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<Object>} - Document data
   */
  getDoc: async function(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },
  
  /**
   * Get multiple documents from Firestore
   * @param {string} collection - Collection name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of documents
   */
  getDocs: async function(collection, options = {}) {
    try {
      let query = db.collection(collection);
      
      // Apply where clauses
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          query = query.where(field, operator, value);
        });
      }
      
      // Apply orderBy
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        query = query.orderBy(field, direction);
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },
  
  /**
   * Add document to Firestore
   * @param {string} collection - Collection name
   * @param {Object} data - Document data
   * @returns {Promise<string>} - Document ID
   */
  addDoc: async function(collection, data) {
    try {
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },
  
  /**
   * Update document in Firestore
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {Object} data - Data to update
   */
  updateDoc: async function(collection, docId, data) {
    try {
      await db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },
  
  /**
   * Delete document from Firestore
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   */
  deleteDoc: async function(collection, docId) {
    try {
      await db.collection(collection).doc(docId).delete();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  /**
   * ============================================
   * UI HELPERS
   * ============================================
   */
  
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: success, error, warning, info
   * @param {number} duration - Duration in ms (default: 3000)
   */
  showToast: function(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slideInRight`;
    
    // Icon based on type
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span style="font-size: 1.5rem;">${icons[type] || icons.info}</span>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 1.25rem; color: inherit; opacity: 0.7;">×</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  /**
   * Show loader
   */
  showLoader: function() {
    let loader = document.getElementById('loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'loader';
      loader.className = 'loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="spinner"></div>
          <div class="loader-text">Loading...</div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.add('active');
  },
  
  /**
   * Hide loader
   */
  hideLoader: function() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('active');
    }
  },
  
  /**
   * Show modal
   * @param {string} modalId - Modal element ID
   */
  showModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },
  
  /**
   * Hide modal
   * @param {string} modalId - Modal element ID
   */
  hideModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Confirm dialog
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>} - User's choice
   */
  confirm: async function(message) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  },
  
  /**
   * ============================================
   * FORM VALIDATION
   * ============================================
   */
  
  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid
   */
  isValidEmail: function(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Validate phone number (Indian)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Is valid
   */
  isValidPhone: function(phone) {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  validatePassword: function(password) {
    const result = {
      isValid: false,
      strength: 'weak',
      errors: []
    };
    
    if (password.length < 8) {
      result.errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      result.errors.push('Password must contain uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      result.errors.push('Password must contain lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      result.errors.push('Password must contain number');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      result.errors.push('Password must contain special character');
    }
    
    if (result.errors.length === 0) {
      result.isValid = true;
      result.strength = 'strong';
    } else if (result.errors.length <= 2) {
      result.strength = 'medium';
    }
    
    return result;
  },
  
  /**
   * Sanitize input
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput: function(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },
  
  /**
   * ============================================
   * DATE & TIME UTILITIES
   * ============================================
   */
  
  /**
   * Format date
   * @param {Date|Timestamp} date - Date to format
   * @param {string} format - Format string
   * @returns {string} - Formatted date
   */
  formatDate: function(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    // Convert Firestore Timestamp to Date
    if (date.toDate) {
      date = date.toDate();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
      .replace('HH', hours)
      .replace('mm', minutes);
  },
  
  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {Date|Timestamp} date - Date to compare
   * @returns {string} - Relative time string
   */
  getRelativeTime: function(date) {
    if (!date) return '';
    
    if (date.toDate) {
      date = date.toDate();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return this.formatDate(date);
  },
  
  /**
   * Check if prescription is expired
   * @param {Date|Timestamp} createdAt - Creation date
   * @param {number} expiryDays - Days until expiry (default: 7)
   * @returns {boolean} - Is expired
   */
  isExpired: function(createdAt, expiryDays = 7) {
    if (!createdAt) return true;
    
    if (createdAt.toDate) {
      createdAt = createdAt.toDate();
    } else if (!(createdAt instanceof Date)) {
      createdAt = new Date(createdAt);
    }
    
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    return new Date() > expiryDate;
  },
  
  /**
   * Calculate expiry date
   * @param {Date|Timestamp} createdAt - Creation date
   * @param {number} expiryDays - Days until expiry (default: 7)
   * @returns {Date} - Expiry date
   */
  calculateExpiry: function(createdAt, expiryDays = 7) {
    if (!createdAt) return null;
    
    if (createdAt.toDate) {
      createdAt = createdAt.toDate();
    } else if (!(createdAt instanceof Date)) {
      createdAt = new Date(createdAt);
    }
    
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    return expiryDate;
  },
  
  /**
   * ============================================
   * NUMBER FORMATTING
   * ============================================
   */
  
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} - Formatted number
   */
  formatNumber: function(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  /**
   * Format currency (Indian Rupees)
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency
   */
  formatCurrency: function(amount) {
    if (amount === null || amount === undefined) return '₹0';
    return '₹' + this.formatNumber(amount);
  },
  
  /**
   * ============================================
   * STRING UTILITIES
   * ============================================
   */
  
  /**
   * Truncate string
   * @param {string} str - String to truncate
   * @param {number} length - Max length
   * @returns {string} - Truncated string
   */
  truncate: function(str, length = 50) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },
  
  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalize: function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} - Random string
   */
  randomString: function(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * Generate verification code
   * @returns {string} - 6-digit code
   */
  generateVerificationCode: function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  
  /**
   * ============================================
   * URL UTILITIES
   * ============================================
   */
  
  /**
   * Get URL parameters
   * @returns {Object} - URL parameters
   */
  getUrlParams: function() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  },
  
  /**
   * Update URL parameter
   * @param {string} key - Parameter key
   * @param {string} value - Parameter value
   */
  updateUrlParam: function(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },
  
  /**
   * ============================================
   * LOCAL STORAGE
   * ============================================
   */
  
  /**
   * Set local storage item
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  setStorage: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting storage:', error);
    }
  },
  
  /**
   * Get local storage item
   * @param {string} key - Storage key
   * @returns {any} - Stored value
   */
  getStorage: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting storage:', error);
      return null;
    }
  },
  
  /**
   * Remove local storage item
   * @param {string} key - Storage key
   */
  removeStorage: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing storage:', error);
    }
  },
  
  /**
   * ============================================
   * DEBOUNCE & THROTTLE
   * ============================================
   */
  
  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  debounce: function(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function} - Throttled function
   */
  throttle: function(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * ============================================
   * SCROLL UTILITIES
   * ============================================
   */
  
  /**
   * Smooth scroll to element
   * @param {string} elementId - Element ID
   */
  scrollTo: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
  
  /**
   * Scroll to top
   */
  scrollToTop: function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  /**
   * ============================================
   * COPY TO CLIPBOARD
   * ============================================
   */
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  copyToClipboard: async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast('Failed to copy', 'error');
    }
  },
  
  /**
   * ============================================
   * DOWNLOAD UTILITIES
   * ============================================
   */
  
  /**
   * Download file
   * @param {string} url - File URL
   * @param {string} filename - File name
   */
  downloadFile: function(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  /**
   * ============================================
   * ANALYTICS
   * ============================================
   */
  
  /**
   * Track event
   * @param {string} eventName - Event name
   * @param {Object} params - Event parameters
   */
  trackEvent: function(eventName, params = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
}
