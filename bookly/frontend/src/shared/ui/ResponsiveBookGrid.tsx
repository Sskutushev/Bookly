// src/shared/ui/ResponsiveBookGrid.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveBookGridProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveBookGrid: React.FC<ResponsiveBookGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default ResponsiveBookGrid;