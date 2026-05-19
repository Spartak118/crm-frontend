import React, { useState } from 'react';
import { useAutomation } from '../../contexts/AutomationContext';
import './AutomationList.css';

const AutomationList = ({ automations, onEdit }) => {
  const { deleteAutomation, toggleAutomation } = useAutomation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [automationToDelete, setAutomationToDelete] = useState(null);

  const getTriggerIcon = (type) => {
    switch(type) {
      case 'customer.created': return '👤➕';
      case 'customer.updated': return '👤✏️';
      case 'deal.moved': return '💼➡️';
      case 'schedule': return '⏰';
      case 'email.received': return '📧';
      default: return '⚡';
    }
  };

  const getActionIcons = (actions) => {
    return actions.map(a => {
      switch(a.type) {
        case 'email.send': return '📧';
        case 'notification.create': return '🔔';
        case 'task.create': return '✅';
        case 'report.generate': return '📊';
        case 'webhook.call': return '🌐';
        default: return '⚡';
      }
    }).join(' ');
  };

  const confirmDelete = () => {
    if (automationToDelete) {
      deleteAutomation(automationToDelete);
      setShowDeleteModal(false);
      setAutomationToDelete(null);
    }
  };

  return (
    <div className="automation-list">
      <h2>Your Workflows</h2>
      
      {automations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">⚡</span>
          <p>No workflows yet</p>
          <span>Create your first automation workflow</span>
          <button className="create-first-btn" onClick={() => onEdit(null)}>
            + Create Workflow
          </button>
        </div>
      ) : (
        <div className="workflows-grid">
          {automations.map(automation => (
            <div key={automation.id} className={`workflow-card ${!automation.enabled ? 'paused' : ''}`}>
              <div className="workflow-header">
                <div className="workflow-status">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={automation.enabled}
                      onChange={() => toggleAutomation(automation.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-badge ${automation.enabled ? 'active' : 'paused'}`}>
                    {automation.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="workflow-actions">
                  <button className="icon-btn" onClick={() => onEdit(automation)} title="Edit">✏️</button>
                  <button 
                    className="icon-btn delete" 
                    onClick={() => {
                      setAutomationToDelete(automation.id);
                      setShowDeleteModal(true);
                    }}
                    title="Delete"
                  >🗑️</button>
                </div>
              </div>

              <div className="workflow-body">
                <h3>{automation.name}</h3>
                <p className="workflow-description">{automation.description}</p>

                <div className="workflow-trigger">
                  <div className="trigger-label">WHEN</div>
                  <div className="trigger-content">
                    <span className="trigger-icon">{getTriggerIcon(automation.trigger.type)}</span>
                    <span className="trigger-text">
                      {automation.trigger.type === 'customer.created' && 'Customer is added'}
                      {automation.trigger.type === 'customer.updated' && 'Customer is updated'}
                      {automation.trigger.type === 'deal.moved' && 'Deal stage changes'}
                      {automation.trigger.type === 'schedule' && `Every ${automation.trigger.config?.frequency || 'day'}`}
                    </span>
                  </div>
                </div>

                {automation.trigger.conditions?.length > 0 && (
                  <div className="workflow-conditions">
                    <div className="conditions-label">IF</div>
                    <div className="conditions-list">
                      {automation.trigger.conditions.map((cond, i) => (
                        <div key={i} className="condition-chip">
                          {cond.field} {cond.operator} {cond.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="workflow-actions-list">
                  <div className="actions-label">THEN</div>
                  <div className="actions-icons">
                    {getActionIcons(automation.actions)}
                  </div>
                  <div className="actions-count">
                    {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="workflow-footer">
                <span className="workflow-date">
                  Updated {new Date(automation.updatedAt || automation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Delete Workflow?</h3>
            <p>Are you sure you want to delete this automation workflow? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationList;