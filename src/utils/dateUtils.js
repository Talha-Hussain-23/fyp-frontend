/**
 * Format a date string (ISO format) to display in local timezone
 * 
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Default options for date formatting
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date to show only the date part in local timezone
 */
export function formatDateOnly(dateString) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get the date string from an ISO date string in local timezone
 */
export function getLocalDateString(dateString) {
  if (!dateString) return 'N/A';
  return formatDate(dateString);
}

/**
 * Get the date and time string from an ISO date string in local timezone
 */
export function getLocalDateTimeString(dateString) {
  if (!dateString) return 'N/A';
  
  return formatDate(dateString, {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit'
  });
}


/**
 * Convert ISO date string (UTC) to LocalDateTime string (YYYY-MM-DDThh:mm)
 * Used for input type="datetime-local" values
 */
export function toDateTimeLocal(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Adjust to local time
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMs);
    // Return formatted string YYYY-MM-DDThh:mm
    return localDate.toISOString().slice(0, 16);
  } catch (e) {
    console.error('Error converting to local datetime:', e);
    return '';
  }
}

/**
 * Convert LocalDateTime string (YYYY-MM-DDThh:mm) to ISO date string (UTC)
 * Used for sending input values to API
 */
export function toUTCISOString(localString) {
  if (!localString) return null;
  try {
    const date = new Date(localString);
    return date.toISOString();
  } catch (e) {
    console.error('Error converting to UTC:', e);
    return null;
  }
}
