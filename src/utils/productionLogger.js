/**
 * Production Logger Configuration
 * Disables debug logs in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Override console methods in production
if (!isDevelopment) {
  // Preserve original console for critical errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Disable debug logs
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  
  // Keep warnings and errors but sanitize
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && !args[0].includes('password')) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && !args[0].includes('password')) {
      originalError.apply(console, args);
    }
  };
}

export default {
  isDevelopment,
  isProduction: !isDevelopment
};
