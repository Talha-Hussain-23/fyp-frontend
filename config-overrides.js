const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  // Ignore Node.js modules that face-api.js tries to use in browser
  addWebpackResolve({
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  }),
  (config) => {
    // Suppress infrastructure logging except errors
    config.infrastructureLogging = { level: 'error' };
    
    // Suppress webpack-dev-server deprecation warnings
    if (config.devServer) {
      config.devServer.client = {
        ...config.devServer.client,
        logging: 'error',
        overlay: {
          errors: true,
          warnings: false,
        },
      };
    }
    
    // Suppress Node.js deprecation warnings in development
    if (process.env.NODE_ENV === 'development') {
      const originalEmit = process.emit;
      process.emit = function (name, data, ...args) {
        if (
          name === 'warning' &&
          typeof data === 'object' &&
          data.name === 'DeprecationWarning' &&
          (data.message.includes('onAfterSetupMiddleware') ||
           data.message.includes('onBeforeSetupMiddleware'))
        ) {
          return false;
        }
        return originalEmit.apply(process, arguments);
      };
    }
    
    // Ignore source map warnings from face-api.js
    config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        function ignoreSourcemapsloaderWarnings(warning) {
            return (
                warning.module &&
                warning.module.resource &&
                warning.module.resource.includes('face-api.js') &&
                warning.details &&
                warning.details.includes('source-map-loader')
            );
        },
    ];
    
    return config;
  }
);

