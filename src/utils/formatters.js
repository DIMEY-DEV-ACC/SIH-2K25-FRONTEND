// Formatting utilities
export const formatters = {
  // Date formatting
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDateForInput: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Currency formatting
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  // Number formatting
  formatNumber: (number) => {
    if (!number && number !== 0) return '';
    return new Intl.NumberFormat('en-IN').format(number);
  },

  // Phone formatting
  formatPhone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // Name formatting
  formatName: (firstName, lastName) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ');
  },

  // Status formatting
  formatStatus: (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  },

  // Truncate text
  truncateText: (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Capitalize first letter
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Convert to title case
  toTitleCase: (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
};