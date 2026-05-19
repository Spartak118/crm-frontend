import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, type = 'delete' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <div className="confirm-modal-content">
          <div className="confirm-modal-icon">
            {type === 'logout' ? (
              <span className="logout-icon">👋</span>
            ) : (
              <span className="warning-icon">⚠️</span>
            )}
          </div>
          <h3 className="confirm-modal-title">
            {type === 'logout' ? 'Logout Confirmation' : 'Confirm Action'}
          </h3>
          <p className="confirm-modal-message">{message}</p>
          <div className="confirm-modal-buttons">
            <button className="confirm-modal-btn cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className={`confirm-modal-btn confirm-btn ${type === 'logout' ? 'logout-btn' : ''}`} 
              onClick={onConfirm}
            >
              {type === 'logout' ? 'Yes, Logout' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;