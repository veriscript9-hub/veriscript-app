/**
 * VeriScript Utility Functions
 */

// Show loading spinner
function showLoading(message = 'Loading...') {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    const loaderText = loader.querySelector('.loader-text');
    if (loaderText) loaderText.textContent = message;
  }
}

// Hide loading spinner
function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-IN', options);
}

// Format phone number
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91-XXXXX-XXXXX
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
}

// Validate phone number
function validatePhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
}

// Validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random ID
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy', 'error');
    return false;
  }
}

// Download as file
function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check authentication state
function checkAuth(redirectUrl = '/index.html') {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(user => {
      if (user) {
        resolve(user);
      } else {
        window.location.href = redirectUrl;
        reject(new Error('Not authenticated'));
      }
    });
  });
}

// Logout function
async function logout() {
  try {
    await auth.signOut();
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error logging out', 'error');
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Calculate prescription expiry
function calculateExpiry(createdAt) {
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const expiry = new Date(created.getTime() + (APP_CONFIG.prescriptionExpiryDays * 24 * 60 * 60 * 1000));
  return expiry;
}

// Check if prescription is expired
function isExpired(createdAt) {
  const expiry = calculateExpiry(createdAt);
  return new Date() > expiry;
}

// Get days until expiry
function getDaysUntilExpiry(createdAt) {
  const expiry = calculateExpiry(createdAt);
  const now = new Date();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Sanitize input
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Export functions
window.utils = {
  showLoading,
  hideLoading,
  showToast,
  formatDate,
  formatPhoneNumber,
  validatePhone,
  validateEmail,
  generateId,
  copyToClipboard,
  downloadFile,
  getUrlParams,
  debounce,
  checkAuth,
  logout,
  formatCurrency,
  calculateExpiry,
  isExpired,
  getDaysUntilExpiry,
  sanitizeInput
};
