import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          ref={ref}
          className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
