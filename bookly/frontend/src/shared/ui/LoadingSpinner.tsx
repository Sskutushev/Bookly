// src/shared/ui/LoadingSpinner.tsx

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-primary-light dark:border-primary-dark border-t-transparent animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;