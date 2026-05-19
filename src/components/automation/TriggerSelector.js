import React, { useState } from 'react';
import './TriggerSelector.css';

const TriggerSelector = ({ selected, onSelect }) => {
  const [search, setSearch] = useState('');

  const triggers = [
    {
      category: 'Customers',
      items: [
        { id: 'customer.created', name: 'Customer Created', icon: '👤➕', description: 'When a new customer is added' },
        { id: 'customer.updated', name: 'Customer Updated', icon: '👤✏️', description: 'When a customer is edited' },
        { id: 'customer.deleted', name: 'Customer Deleted', icon: '👤🗑️', description: 'When a customer is removed' },
        { id: 'customer.status', name: 'Status Changed', icon: '🔄', description: 'When customer status changes' }
      ]
    },
    {
      category: 'Deals',
      items: [
        { id: 'deal.created', name: 'Deal Created', icon: '💼➕', description: 'When a new deal is added' },
        { id: 'deal.moved', name: 'Deal Moved', icon: '📦➡️', description: 'When deal stage changes' },
        { id: 'deal.won', name: 'Deal Won', icon: '🏆', description: 'When a deal is won' },
        { id: 'deal.lost', name: 'Deal Lost', icon: '💔', description: 'When a deal is lost' }
      ]
    },
    {
      category: 'Schedule',
      items: [
        { id: 'schedule', name: 'Scheduled Time', icon: '⏰', description: 'Run at specific times' }
      ]
    },
    {
      category: 'Tasks',
      items: [
        { id: 'task.created', name: 'Task Created', icon: '✅➕', description: 'When a new task is created' },
        { id: 'task.completed', name: 'Task Completed', icon: '✅🎉', description: 'When a task is done' }
      ]
    },
    {
      category: 'System',
      items: [
        { id: 'webhook', name: 'Webhook Received', icon: '🌐', description: 'When external webhook is called' },
        { id: 'email.received', name: 'Email Received', icon: '📧', description: 'When email arrives' }
      ]
    }
  ];

  const filteredTriggers = triggers.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="trigger-selector">
      <div className="trigger-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search triggers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="triggers-list">
        {filteredTriggers.map(category => (
          <div key={category.category} className="trigger-category">
            <h4 className="category-title">{category.category}</h4>
            <div className="category-items">
              {category.items.map(trigger => (
                <button
                  key={trigger.id}
                  className={`trigger-item ${selected === trigger.id ? 'selected' : ''}`}
                  onClick={() => onSelect(trigger.id)}
                >
                  <span className="trigger-icon">{trigger.icon}</span>
                  <div className="trigger-info">
                    <span className="trigger-name">{trigger.name}</span>
                    <span className="trigger-description">{trigger.description}</span>
                  </div>
                  {selected === trigger.id && (
                    <span className="trigger-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredTriggers.length === 0 && (
          <div className="no-triggers">
            <span className="no-icon">🔍</span>
            <p>No triggers found</p>
            <span>Try a different search term</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriggerSelector;