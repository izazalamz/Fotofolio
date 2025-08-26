import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    primary: 'bg-blue-100 text-blue-800',
    open: 'bg-blue-100 text-blue-800',
    locked: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
