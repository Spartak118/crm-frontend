import React, { useState } from 'react';
import './ActionSelector.css';

const ActionSelector = ({ onAddAction }) => {
  const [selectedCategory, setSelectedCategory] = useState('notifications');
  const [config, setConfig] = useState({});
  const [showConfig, setShowConfig] = useState(false);

  const actionCategories = [
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'reports', name: 'Reports', icon: '📊' },
    { id: 'webhooks', name: 'Webhooks', icon: '🌐' },
    { id: 'delay', name: 'Delay', icon: '⏱️' }
  ];

  const actions = {
    notifications: [
      { 
        id: 'notification.create', 
        name: 'Show Notification', 
        icon: '🔔',
        description: 'Display a notification in the app',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true },
          { name: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'] }
        ]
      },
      { 
        id: 'notification.sound', 
        name: 'Play Sound', 
        icon: '🔊',
        description: 'Play a sound notification',
        fields: [
          { name: 'sound', label: 'Sound', type: 'select', options: ['noti', 'success', 'reminder', 'error', 'complete'] }
        ]
      }
    ],
    email: [
      { 
        id: 'email.send', 
        name: 'Send Email', 
        icon: '📧',
        description: 'Send an email to someone',
        fields: [
          { name: 'to', label: 'To', type: 'email', required: true },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          { name: 'template', label: 'Template', type: 'select', options: ['welcome', 'reminder', 'report', 'custom'] },
          { name: 'delay', label: 'Delay (seconds)', type: 'number', min: 0 }
        ]
      }
    ],
    tasks: [
      { 
        id: 'task.create', 
        name: 'Create Task', 
        icon: '✅',
        description: 'Create a new task',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'assignee', label: 'Assign to', type: 'text' },
          { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
          { name: 'dueDate', label: 'Due date', type: 'date' }
        ]
      }
    ],
    reports: [
      { 
        id: 'report.generate', 
        name: 'Generate Report', 
        icon: '📊',
        description: 'Create and send a report',
        fields: [
          { name: 'type', label: 'Report Type', type: 'select', options: ['sales', 'customers', 'pipeline', 'team'], required: true },
          { name: 'format', label: 'Format', type: 'select', options: ['pdf', 'excel', 'csv'] },
          { name: 'recipients', label: 'Email to', type: 'text', placeholder: 'email@example.com' }
        ]
      }
    ],
    webhooks: [
      { 
        id: 'webhook.call', 
        name: 'Call Webhook', 
        icon: '🌐',
        description: 'Send data to external URL',
        fields: [
          { name: 'url', label: 'URL', type: 'url', required: true },
          { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT'] }
        ]
      }
    ],
    delay: [
      { 
        id: 'delay.wait', 
        name: 'Wait', 
        icon: '⏱️',
        description: 'Pause the workflow',
        fields: [
          { name: 'seconds', label: 'Seconds', type: 'number', required: true, min: 1 },
          { name: 'minutes', label: 'Minutes', type: 'number', min: 0 }
        ]
      }
    ]
  };

  const handleAddAction = () => {
    const newAction = {
      type: config.type,
      config: config
    };
    onAddAction(newAction);
    setConfig({});
    setShowConfig(false);
  };

  const renderFields = (action) => {
    return action.fields.map(field => (
      <div key={field.name} className="config-field">
        <label>{field.label}{field.required && ' *'}</label>
        {field.type === 'text' && (
          <input
            type="text"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
        {field.type === 'email' && (
          <input
            type="email"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
        {field.type === 'url' && (
          <input
            type="url"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
        {field.type === 'number' && (
          <input
            type="number"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: parseInt(e.target.value)})}
            min={field.min}
            required={field.required}
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            rows="3"
            required={field.required}
          />
        )}
        {field.type === 'select' && (
          <select
            value={config[field.name] || field.options[0]}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            required={field.required}
          >
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
        {field.type === 'date' && (
          <input
            type="date"
            value={config[field.name] || ''}
            onChange={(e) => setConfig({...config, [field.name]: e.target.value})}
            required={field.required}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="action-selector">
      {!showConfig ? (
        <>
          {/* Categories */}
          <div className="action-categories">
            {actionCategories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Actions List */}
          <div className="actions-grid">
            {actions[selectedCategory]?.map(action => (
              <button
                key={action.id}
                className="action-card"
                onClick={() => {
                  setConfig({ type: action.id });
                  setShowConfig(true);
                }}
              >
                <span className="action-icon">{action.icon}</span>
                <div className="action-info">
                  <span className="action-name">{action.name}</span>
                  <span className="action-description">{action.description}</span>
                </div>
                <span className="action-add">+</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        // Configuration Form
        <div className="action-config">
          <div className="config-header">
            <button className="back-btn" onClick={() => setShowConfig(false)}>
              ← Back
            </button>
            <h3>Configure Action</h3>
          </div>

          {actions[selectedCategory]
            ?.find(a => a.id === config.type)
            ?.fields && renderFields(actions[selectedCategory].find(a => a.id === config.type))}

          <div className="config-actions">
            <button className="btn-secondary" onClick={() => setShowConfig(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddAction}>
              Add Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionSelector;