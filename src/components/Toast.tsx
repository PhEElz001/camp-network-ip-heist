import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 1600);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <div 
      className={`absolute right-4 bottom-4 bg-card/90 border border-border backdrop-blur-sm px-4 py-2 rounded-xl text-primary font-bold transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};