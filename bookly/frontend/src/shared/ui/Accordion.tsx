// frontend/src/shared/ui/Accordion.tsx

import React, { createContext, useContext, useState } from 'react';

interface AccordionContextType {
  value: string | null;
  onChange: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  defaultValue, 
  value: controlledValue, 
  onValueChange 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || null);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(prev => prev === newValue ? null : newValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ value, onChange: handleChange }}>
      <div className="w-full">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ value, children }) => {
  return <div className="w-full">{children}</div>;
};

interface AccordionHeaderProps {
  children: React.ReactNode;
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ children }) => {
  return <div className="w-full">{children}</div>;
};

interface AccordionPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionPanel: React.FC<AccordionPanelProps> = ({ children, className }) => {
  const context = useContext(AccordionContext);
  if (context === undefined) {
    throw new Error('AccordionPanel must be used within an Accordion');
  }

  // Using context directly instead of destructuring value to avoid unused variable error
  return (
    <div className={className}>
      {context.value !== null && <div className={`${context.value ? 'block' : 'hidden'}`}>{children}</div>}
    </div>
  );
};