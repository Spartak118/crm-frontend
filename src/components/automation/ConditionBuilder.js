import React, { useState } from 'react';
import './ConditionBuilder.css';

const ConditionBuilder = ({ conditions, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCondition, setNewCondition] = useState({
    field: 'status',
    operator: 'equals',
    value: ''
  });

  const fields = [
    { id: 'status', name: 'Status', type: 'select', options: ['Lead', 'Prospect', 'Active', 'VIP'] },
    { id: 'deal_value', name: 'Deal Value', type: 'number' },
    { id: 'company', name: 'Company Name', type: 'text' },
    { id: 'email', name: 'Email', type: 'text' },
    { id: 'phone', name: 'Phone', type: 'text' },
    { id: 'last_contact', name: 'Last Contact', type: 'date' },
    { id: 'created_at', name: 'Created Date', type: 'date' }
  ];

  const operators = [
    { id: 'equals', name: 'Equals', symbol: '=' },
    { id: 'not_equals', name: 'Not Equals', symbol: '≠' },
    { id: 'contains', name: 'Contains', symbol: '⊃' },
    { id: 'not_contains', name: 'Not Contains', symbol: '⊅' },
    { id: 'greater_than', name: 'Greater Than', symbol: '>' },
    { id: 'less_than', name: 'Less Than', symbol: '<' },
    { id: 'starts_with', name: 'Starts With', symbol: '^' },
    { id: 'ends_with', name: 'Ends With', symbol: '$' }
  ];

  const addCondition = () => {
    if (newCondition.value) {
      onChange([...conditions, newCondition]);
      setNewCondition({ field: 'status', operator: 'equals', value: '' });
      setShowAdd(false);
    }
  };

  const removeCondition = (index) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index, updates) => {
    onChange(conditions.map((cond, i) => i === index ? { ...cond, ...updates } : cond));
  };

  const getFieldOptions = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.type === 'select' ? field.options : [];
  };

  return (
    <div className="condition-builder">
      {/* Existing Conditions */}
      {conditions.length > 0 && (
        <div className="conditions-list">
          {conditions.map((condition, index) => (
            <div key={index} className="condition-row">
              <div className="condition-fields">
                <select
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  className="condition-field"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, { operator: e.target.value })}
                  className="condition-operator"
                >
                  {operators.map(op => (
                    <option key={op.id} value={op.id}>{op.symbol} {op.name}</option>
                  ))}
                </select>

                {getFieldOptions(condition.field).length > 0 ? (
                  <select
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    className="condition-value"
                  >
                    <option value="">Select value...</option>
                    {getFieldOptions(condition.field).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fields.find(f => f.id === condition.field)?.type || 'text'}
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Enter value..."
                    className="condition-value"
                  />
                )}
              </div>
              <button 
                className="remove-condition"
                onClick={() => removeCondition(index)}
                title="Remove condition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Condition */}
      {showAdd ? (
        <div className="add-condition">
          <div className="condition-fields">
            <select
              value={newCondition.field}
              onChange={(e) => setNewCondition({ ...newCondition, field: e.target.value })}
              className="condition-field"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              value={newCondition.operator}
              onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
              className="condition-operator"
            >
              {operators.map(op => (
                <option key={op.id} value={op.id}>{op.symbol} {op.name}</option>
              ))}
            </select>

            {getFieldOptions(newCondition.field).length > 0 ? (
              <select
                value={newCondition.value}
                onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                className="condition-value"
              >
                <option value="">Select value...</option>
                {getFieldOptions(newCondition.field).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={fields.find(f => f.id === newCondition.field)?.type || 'text'}
                value={newCondition.value}
                onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                placeholder="Enter value..."
                className="condition-value"
              />
            )}
          </div>
          <div className="add-actions">
            <button className="btn-secondary small" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button 
              className="btn-primary small" 
              onClick={addCondition}
              disabled={!newCondition.value}
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button className="add-condition-btn" onClick={() => setShowAdd(true)}>
          <span className="plus-icon">+</span>
          Add Condition
        </button>
      )}

      {/* Logical Operator (if multiple conditions) */}
      {conditions.length > 1 && (
        <div className="logical-operator">
          <span className="operator-badge">ALL conditions must be true (AND)</span>
          <button 
            className="change-operator"
            onClick={() => alert('AND/OR toggle coming soon!')}
          >
            Change to OR
          </button>
        </div>
      )}
    </div>
  );
};

export default ConditionBuilder;