import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import RequireAuth from '../components/RequireAuth';
import ExportImport from '../components/ExportImport';
import './Pipeline.css';

// Функции для работы с деньгами
const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  let num = amount;
  if (typeof amount === 'string') {
    if (amount.includes('K')) num = parseFloat(amount) * 1000;
    else if (amount.includes('M')) num = parseFloat(amount) * 1000000;
    else if (amount.includes('B')) num = parseFloat(amount) * 1000000000;
    else num = parseFloat(amount);
  }
  
  if (isNaN(num)) return '$0';
  
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num}`;
};

const parseMoneyInput = (value) => {
  if (!value) return 0;
  
  const str = value.toString().toUpperCase();
  if (str.includes('K')) return parseFloat(str) * 1000;
  if (str.includes('M')) return parseFloat(str) * 1000000;
  if (str.includes('B')) return parseFloat(str) * 1000000000;
  return parseFloat(str) || 0;
};

const Pipeline = () => {
  const { currentUser, userData, updateUserPipeline } = useAuth();
  const { addNotification } = useNotifications();
  
  // Загружаем из данных пользователя или создаем новые
  const [stages, setStages] = useState(() => {
    if (userData?.pipelineStages) {
      return userData.pipelineStages;
    }
    return [
      {
        id: 1,
        name: 'Lead',
        color: '#ffd700',
        deals: []
      },
      {
        id: 2,
        name: 'Prospect',
        color: '#87ceeb',
        deals: []
      },
      {
        id: 3,
        name: 'Opportunity',
        color: '#98fb98',
        deals: []
      },
      {
        id: 4,
        name: 'Customer',
        color: '#90ee90',
        deals: []
      },
      {
        id: 5,
        name: 'VIP',
        color: '#dda0dd',
        deals: []
      }
    ];
  });

  // Сохраняем изменения в данные пользователя
  useEffect(() => {
    if (currentUser) {
      updateUserPipeline(stages);
    }
  }, [stages, currentUser, updateUserPipeline]);

  const [draggedDeal, setDraggedDeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [newDeal, setNewDeal] = useState({
    name: '',
    contact: '',
    value: ''
  });

  // Статистика
  const totalValue = stages.reduce((total, stage) => {
    return total + stage.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  }, 0);

  const totalDeals = stages.reduce((total, stage) => total + stage.deals.length, 0);
  const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;

  // Функция для подготовки данных экспорта (ВНУТРИ КОМПОНЕНТА)
  const prepareDealsForExport = () => {
    const allDeals = [];
    stages.forEach(stage => {
      stage.deals.forEach(deal => {
        allDeals.push({
          id: deal.id,
          name: deal.name,
          contact: deal.contact,
          value: formatMoney(deal.value),
          stage: stage.name
        });
      });
    });
    return allDeals;
  };

  const handleDragStart = (e, deal, sourceStageId) => {
    setDraggedDeal({ deal, sourceStageId });
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    
    if (!draggedDeal) return;

    const { deal, sourceStageId } = draggedDeal;

    const newStages = stages.map(stage => {
      if (stage.id === sourceStageId) {
        return {
          ...stage,
          deals: stage.deals.filter(d => d.id !== deal.id)
        };
      }
      return stage;
    });

    setStages(newStages.map(stage => {
      if (stage.id === targetStageId) {
        return {
          ...stage,
          deals: [...stage.deals, deal]
        };
      }
      return stage;
    }));

    setDraggedDeal(null);
    
    addNotification({
      title: '🔄 Deal Moved',
      message: `Deal moved to new stage`,
      icon: '🔄',
      type: 'update'
    });
  };

  const handleAddDeal = (stageId) => {
    setSelectedStage(stageId);
    setNewDeal({ name: '', contact: '', value: '' });
    setShowAddModal(true);
  };

  const handleSubmitDeal = (e) => {
    e.preventDefault();
    
    const dealValue = parseMoneyInput(newDeal.value);
    
    const deal = {
      id: Date.now(),
      name: newDeal.name,
      contact: newDeal.contact,
      value: dealValue
    };

    setStages(stages.map(stage => {
      if (stage.id === selectedStage) {
        return {
          ...stage,
          deals: [...stage.deals, deal]
        };
      }
      return stage;
    }));

    setShowAddModal(false);
    
    addNotification({
      title: '✅ New Deal Added',
      message: `Deal "${newDeal.name}" added to ${stages.find(s => s.id === selectedStage)?.name}`,
      icon: '🎉',
      type: 'success'
    });
  };

  const handleDeleteDeal = (stageId, dealId, dealName) => {
    if (window.confirm(`Delete deal "${dealName}"?`)) {
      setStages(stages.map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            deals: stage.deals.filter(d => d.id !== dealId)
          };
        }
        return stage;
      }));
      
      addNotification({
        title: '🗑️ Deal Deleted',
        message: `Deal "${dealName}" has been removed`,
        icon: '🗑️',
        type: 'delete'
      });
    }
  };

  return (
    <RequireAuth>
      <div className="pipeline-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1>Sales Pipeline</h1>
            <p className="page-description">Drag and drop deals between stages to update progress</p>
          </div>
          <ExportImport 
            customers={prepareDealsForExport()} 
            onImport={() => {}} 
            type="deals"
          />
        </div>
        
        <div className="pipeline-board">
          {stages.map(stage => (
            <div 
              key={stage.id} 
              className="pipeline-stage"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="stage-header" style={{ borderColor: stage.color }}>
                <h3>{stage.name}</h3>
                <span className="deal-count">{stage.deals.length}</span>
              </div>
              
              <div className="stage-deals">
                {stage.deals.length === 0 ? (
                  <p className="empty-stage">No deals yet</p>
                ) : (
                  stage.deals.map(deal => (
                    <div 
                      key={deal.id} 
                      className="deal-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal, stage.id)}
                    >
                      <div className="deal-header">
                        <h4>{deal.name}</h4>
                        <button 
                          className="delete-deal-btn"
                          onClick={() => handleDeleteDeal(stage.id, deal.id, deal.name)}
                        >✕</button>
                      </div>
                      <p className="deal-contact">{deal.contact}</p>
                      <p className="deal-value">{formatMoney(deal.value)}</p>
                    </div>
                  ))
                )}
              </div>
              
              <button className="add-deal-btn" onClick={() => handleAddDeal(stage.id)}>
                + Add Deal
              </button>
            </div>
          ))}
        </div>

        {/* Статистика */}
        <div className="pipeline-stats">
          <h2>Pipeline Statistics</h2>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Value</span>
              <span className="stat-number">{formatMoney(totalValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg. Deal Size</span>
              <span className="stat-number">{formatMoney(avgDealSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Deals</span>
              <span className="stat-number">{totalDeals}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-number">0%</span>
            </div>
          </div>
        </div>

        {/* Add Deal Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add New Deal</h2>
              <form onSubmit={handleSubmitDeal}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={newDeal.name}
                    onChange={(e) => setNewDeal({...newDeal, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={newDeal.contact}
                    onChange={(e) => setNewDeal({...newDeal, contact: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Deal Amount ($)</label>
                  <input
                    type="text"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({...newDeal, value: e.target.value})}
                    placeholder="Enter amount (e.g., 1000, 1.5K, 2M, 1B)"
                  />
                  <small style={{ color: 'var(--placeholder-color)', display: 'block', marginTop: '4px' }}>
                    Use K (thousands), M (millions), B (billions)
                  </small>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Deal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
};

export default Pipeline;