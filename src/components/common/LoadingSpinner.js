import React from "react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-dashed rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
    </div>
  </div>
);

export default LoadingSpinner;
