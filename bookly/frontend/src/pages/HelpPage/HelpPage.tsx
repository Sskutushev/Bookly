// frontend/src/pages/HelpPage/HelpPage.tsx

import React from 'react';
import HelpSection from '@/widgets/HelpSection/HelpSection';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <header className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-white/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-light dark:text-primary-dark">
            ❓ Помощь
          </h1>
        </div>
      </header>

      <div className="pt-16 container mx-auto px-4">
        <HelpSection />
      </div>
    </div>
  );
};

export default HelpPage;