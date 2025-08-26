import React from 'react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex gap-3 justify-end">
          {actions}
        </div>
      </div>
    </div>
  );
}
