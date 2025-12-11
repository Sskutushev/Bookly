// frontend/src/shared/ui/ContextMenu.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  options: Array<{
    label: string;
    action: () => void;
    icon?: string;
  }>;
  x: number;
  y: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, onClose, options, x, y }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-0" />
        </Transition.Child>

        <div
          className="fixed z-50 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          style={{
            left: x,
            top: y,
            transform: 'translateY(-100%)',
            minWidth: '180px'
          }}
          ref={menuRef}
        >
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  onClose();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ContextMenu;