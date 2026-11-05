import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Modal({ isOpen, title, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h3>{title}</h3>
          {onClose && (
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * Global Confirmation Dialog Renderer
 */
export function ConfirmationModal() {
  const { confirmation } = useApp();

  if (!confirmation) return null;

  const { title, message, confirmText, danger, onConfirm, onCancel } = confirmation;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
          {danger && (
            <div style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
            </div>
          )}
          <h3>{title}</h3>
        </div>
        <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>
          {message}
        </p>
        <div className="flex justify-between gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
