import React, { useState } from 'react';
import { useAutomation } from '../../contexts/AutomationContext';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';
import ConditionBuilder from './ConditionBuilder';
import './WorkFlowBuilder.css';

const WorkflowBuilder = ({ automation, onSave, onCancel }) => {
  const { addAutomation, updateAutomation } = useAutomation();
  const [step, setStep] = useState(1);
  const [workflow, setWorkflow] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    enabled: automation?.enabled ?? true,
    trigger: automation?.trigger || {
      type: '',
      conditions: []
    },
    actions: automation?.actions || []
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!workflow.name) newErrors.name = 'Workflow name is required';
    if (!workflow.trigger.type) newErrors.trigger = 'Trigger is required';
    if (workflow.actions.length === 0) newErrors.actions = 'At least one action is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (automation) {
      updateAutomation(automation.id, workflow);
    } else {
      addAutomation(workflow);
    }
    onSave();
  };

  const addAction = (action) => {
    setWorkflow({
      ...workflow,
      actions: [...workflow.actions, action]
    });
  };

  const removeAction = (index) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.filter((_, i) => i !== index)
    });
  };

  const updateAction = (index, updatedAction) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.map((a, i) => i === index ? updatedAction : a)
    });
  };

  return (
    <div className="workflow-builder">
      <div className="builder-header">
        <h2>{automation ? 'Edit Workflow' : 'Create New Workflow'}</h2>
        <div className="builder-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Name & Trigger</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Conditions</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Actions</span>
          </div>
        </div>
      </div>

      <div className="builder-content">
        {step === 1 && (
          <div className="step-content">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Workflow Name *</label>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({...workflow, name: e.target.value})}
                placeholder="e.g., Welcome Email, VIP Task, Weekly Report"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={workflow.description}
                onChange={(e) => setWorkflow({...workflow, description: e.target.value})}
                placeholder="What does this workflow do?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Trigger *</label>
              <TriggerSelector 
                selected={workflow.trigger.type}
                onSelect={(type) => setWorkflow({
                  ...workflow, 
                  trigger: { ...workflow.trigger, type }
                })}
              />
              {errors.trigger && <span className="error-message">{errors.trigger}</span>}
            </div>

            {workflow.trigger.type === 'schedule' && (
              <div className="schedule-config">
                <h4>Schedule Settings</h4>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Frequency</label>
                    <select
                      value={workflow.trigger.config?.frequency || 'daily'}
                      onChange={(e) => setWorkflow({
                        ...workflow,
                        trigger: {
                          ...workflow.trigger,
                          config: { ...workflow.trigger.config, frequency: e.target.value }
                        }
                      })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>Time</label>
                    <input
                      type="time"
                      value={workflow.trigger.config?.time || '09:00'}
                      onChange={(e) => setWorkflow({
                        ...workflow,
                        trigger: {
                          ...workflow.trigger,
                          config: { ...workflow.trigger.config, time: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
                {workflow.trigger.config?.frequency === 'weekly' && (
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select
                      value={workflow.trigger.config?.day || '1'}
                      onChange={(e) => setWorkflow({
                        ...workflow,
                        trigger: {
                          ...workflow.trigger,
                          config: { ...workflow.trigger.config, day: parseInt(e.target.value) }
                        }
                      })}
                    >
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>
                )}
                {workflow.trigger.config?.frequency === 'monthly' && (
                  <div className="form-group">
                    <label>Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={workflow.trigger.config?.day || '1'}
                      onChange={(e) => setWorkflow({
                        ...workflow,
                        trigger: {
                          ...workflow.trigger,
                          config: { ...workflow.trigger.config, day: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>Conditions (Optional)</h3>
            <p className="step-description">
              Add conditions to control when this workflow should run
            </p>
            
            <ConditionBuilder
              conditions={workflow.trigger.conditions || []}
              onChange={(conditions) => setWorkflow({
                ...workflow,
                trigger: { ...workflow.trigger, conditions }
              })}
            />

            <div className="condition-examples">
              <h4>Examples:</h4>
              <ul>
                <li>Status equals VIP</li>
                <li>Deal value greater than 10000</li>
                <li>Company contains "Tech"</li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3>Actions</h3>
            <p className="step-description">
              What should happen when this workflow is triggered?
            </p>

            <ActionSelector onAddAction={addAction} />

            {workflow.actions.length > 0 && (
              <div className="actions-list">
                <h4>Scheduled Actions:</h4>
                {workflow.actions.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-icon">
                      {action.type === 'email.send' && '📧'}
                      {action.type === 'notification.create' && '🔔'}
                      {action.type === 'task.create' && '✅'}
                      {action.type === 'report.generate' && '📊'}
                      {action.type === 'webhook.call' && '🌐'}
                    </div>
                    <div className="action-details">
                      <div className="action-type">{action.type}</div>
                      <div className="action-config">
                        {action.type === 'email.send' && `Send email: ${action.config.subject}`}
                        {action.type === 'notification.create' && `Show notification: ${action.config.message}`}
                        {action.type === 'task.create' && `Create task: ${action.config.title}`}
                        {action.type === 'report.generate' && `Generate ${action.config.type} report`}
                        {action.type === 'webhook.call' && `Call webhook: ${action.config.url}`}
                      </div>
                    </div>
                    <div className="action-actions">
                      {action.config.delay > 0 && (
                        <span className="action-delay">⏱️ {action.config.delay}s</span>
                      )}
                      <button 
                        className="icon-btn small"
                        onClick={() => {
                          const newConfig = { ...action.config, delay: (action.config.delay || 0) + 60 };
                          updateAction(index, { ...action, config: newConfig });
                        }}
                        title="Add delay"
                      >
                        ⏱️
                      </button>
                      <button 
                        className="icon-btn small delete"
                        onClick={() => removeAction(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.actions && <span className="error-message">{errors.actions}</span>}
          </div>
        )}
      </div>

      <div className="builder-footer">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <div className="footer-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              Previous
            </button>
          )}
          {step < 3 ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              {automation ? 'Update Workflow' : 'Create Workflow'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;