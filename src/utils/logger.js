/**
 * Frontend Logging Service
 * Provides structured logging and request ID generation
 */

// Generate a UUID v4
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};



export const logger = {
  info: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${message}`, meta || '');
    }
  },
  
  error: (message, error, meta = {}) => {
    // Always log errors, even in production, but sanitize in a real app (simplified here)
    const errorDetails = {
      error: error?.toString(),
      stack: error?.stack,
      ...meta
    };
    console.error(`[ERROR] ${message}`, errorDetails);
  },
  
  warn: (message, meta) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
};

export default logger;
