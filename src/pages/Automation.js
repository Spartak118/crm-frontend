import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAutomation } from '../contexts/AutomationContext';
import RequireAuth from '../components/RequireAuth';
import WorkflowBuilder from '../components/automation/WorkFlowBuilder';
import AutomationList from '../components/automation/AutomationList';
import './Automation.css';

const Automation = () => {
  const { currentUser } = useAuth();
  const { automations, triggerHistory } = useAutomation();
  const [view, setView] = useState('list'); // 'list', 'builder', 'history'
  const [editingAutomation, setEditingAutomation] = useState(null);

  return (
    <RequireAuth>
      <div className="automation-page">
        {/* Header */}
        <div className="automation-header">
          <div>
            <h1>⚡ Automation</h1>
            <p>Create workflows that run automatically</p>
          </div>
          <div className="automation-actions">
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              📋 List
            </button>
            <button 
              className={`view-btn ${view === 'history' ? 'active' : ''}`}
              onClick={() => setView('history')}
            >
              📜 History
            </button>
            <button 
              className="create-btn"
              onClick={() => {
                setEditingAutomation(null);
                setView('builder');
              }}
            >
              + New Workflow
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="automation-stats">
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>Total Workflows</h3>
              <p className="stat-value">{automations.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Active</h3>
              <p className="stat-value">{automations.filter(a => a.enabled).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-info">
              <h3>Paused</h3>
              <p className="stat-value">{automations.filter(a => !a.enabled).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>Triggered Today</h3>
              <p className="stat-value">
                {triggerHistory.filter(h => 
                  new Date(h.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="automation-content">
          {view === 'list' && (
            <AutomationList 
              automations={automations}
              onEdit={(auto) => {
                setEditingAutomation(auto);
                setView('builder');
              }}
            />
          )}

          {view === 'history' && (
            <div className="history-section">
              <h2>Trigger History</h2>
              <div className="history-list">
                {triggerHistory.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No triggers yet</p>
                    <span>Create a workflow and it will appear here</span>
                  </div>
                ) : (
                  triggerHistory.map(item => (
                    <div key={item.id} className="history-item">
                      <div className="history-time">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div className="history-details">
                        <span className="history-action">{item.action}</span>
                        <span className="history-automation">
                          Automation #{item.automationId}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === 'builder' && (
            <WorkflowBuilder 
              automation={editingAutomation}
              onSave={() => setView('list')}
              onCancel={() => setView('list')}
            />
          )}
        </div>
      </div>
    </RequireAuth>
  );
};

export default Automation;