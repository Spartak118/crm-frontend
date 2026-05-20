import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import Newsletter from '../components/Newsletter';
import './Dashboard.css';

// Функция для форматирования денег
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

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [unschoolSignups, setUnschoolSignups] = useState([]);
  const [unschoolLoading, setUnschoolLoading] = useState(true);

  useEffect(() => {
    fetch('https://crm-backend-flame.vercel.app/api/customers')
      .then(r => r.json())
      .then(data => {
        const rows = Array.isArray(data) ? data : (data.customers || []);
        const signups = rows
          .filter(r => r.source === 'UnschoolMe')
          .slice(-5)
          .reverse();
        setUnschoolSignups(signups);
      })
      .catch(() => {})
      .finally(() => setUnschoolLoading(false));
  }, []);

  // Загружаем клиентов из данных пользователя
  const [customers, setCustomers] = useState(() => {
    return userData?.customers || [];
  });

  // Загружаем сделки из данных пользователя
  const [pipelineStages, setPipelineStages] = useState(() => {
    return userData?.pipelineStages || [];
  });

  // Если пользователь не авторизован - показываем красивый блок
  if (!currentUser) {
    return (
      <div className="login-required-container">
        <div className="login-required-card">
          <div className="lock-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to view your dashboard</p>
          <div className="login-actions">
            <a href="/login" className="login-btn-primary">Go to Login</a>
            <a href="/register" className="login-btn-secondary">Create Account</a>
          </div>
          <div className="login-demo">
            <p>Demo access:</p>
            <p className="demo-credentials">admin@crm.com / password123</p>
          </div>
        </div>
      </div>
    );
  }

  // Считаем клиентов по статусам
  const customersByStatus = {
    Lead: customers.filter(c => c.status === 'Lead').length,
    Prospect: customers.filter(c => c.status === 'Prospect').length,
    Active: customers.filter(c => c.status === 'Active').length,
    VIP: customers.filter(c => c.status === 'VIP').length
  };

  // Деньги по статусам
  const getMoneyByStatus = (status) => {
    return customers
      .filter(c => c.status === status)
      .reduce((sum, c) => sum + (parseFloat(c.deals) || 0), 0);
  };

  // Данные для таблицы
  const pipelineData = [
    { 
      stage: 'Lead', 
      customers: customersByStatus.Lead,
      deals: pipelineStages.find(s => s.name === 'Lead')?.deals.length || 0,
      money: getMoneyByStatus('Lead')
    },
    { 
      stage: 'Prospect', 
      customers: customersByStatus.Prospect,
      deals: pipelineStages.find(s => s.name === 'Prospect')?.deals.length || 0,
      money: getMoneyByStatus('Prospect')
    },
    { 
      stage: 'Opportunity', 
      customers: 0,
      deals: pipelineStages.find(s => s.name === 'Opportunity')?.deals.length || 0,
      money: 0
    },
    { 
      stage: 'Customer', 
      customers: customersByStatus.Active,
      deals: pipelineStages.find(s => s.name === 'Customer')?.deals.length || 0,
      money: getMoneyByStatus('Active')
    },
    { 
      stage: 'VIP', 
      customers: customersByStatus.VIP,
      deals: pipelineStages.find(s => s.name === 'VIP')?.deals.length || 0,
      money: getMoneyByStatus('VIP')
    }
  ];

  // Данные для графиков
  const totalCustomers = customers.length;
  const totalDeals = pipelineStages.reduce((sum, s) => sum + s.deals.length, 0);
  const totalMoney = customers.reduce((sum, c) => sum + (parseFloat(c.deals) || 0), 0);

  // Проценты для круговой диаграммы
  const leadPercent = totalCustomers > 0 ? (customersByStatus.Lead / totalCustomers) * 100 : 0;
  const prospectPercent = totalCustomers > 0 ? (customersByStatus.Prospect / totalCustomers) * 100 : 0;
  const activePercent = totalCustomers > 0 ? (customersByStatus.Active / totalCustomers) * 100 : 0;
  const vipPercent = totalCustomers > 0 ? (customersByStatus.VIP / totalCustomers) * 100 : 0;

  // Проценты для денег
  const getMoneyPercentage = (amount) => {
    if (totalMoney === 0) return 0;
    return (amount / totalMoney) * 100;
  };

  // Последние активности
  const recentActivities = [
    ...customers.slice(-3).reverse().map(c => ({
      id: `c-${c.id}`,
      action: 'New customer added',
      customer: c.name,
      time: new Date(c.lastContact).toLocaleDateString()
    }))
  ].slice(0, 5);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p className="stat-value">{totalCustomers}</p>
            <p className="stat-change">+{customersByStatus.Active + customersByStatus.VIP} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Money</h3>
            <p className="stat-value">{formatMoney(totalMoney)}</p>
            <p className="stat-change">from customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Active Deals</h3>
            <p className="stat-value">{totalDeals}</p>
            <p className="stat-change">in pipeline</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>VIP Clients</h3>
            <p className="stat-value">{customersByStatus.VIP}</p>
            <p className="stat-change">premium</p>
          </div>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="dashboard-section">
        <h2>Pipeline Summary</h2>
        <div className="table-container">
          <table className="pipeline-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Customers</th>
                <th>Deals</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {pipelineData.map((item, index) => (
                <tr key={index}>
                  <td className="stage-cell">{item.stage}</td>
                  <td>{item.customers}</td>
                  <td>{item.deals}</td>
                  <td className="money-cell">{formatMoney(item.money)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td><strong>{totalCustomers}</strong></td>
                <td><strong>{totalDeals}</strong></td>
                <td className="money-cell"><strong>{formatMoney(totalMoney)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p className="empty-message">No recent activity</p>
        ) : (
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-action">{activity.action}</span>
                <span className="activity-customer">{activity.customer}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent UnschoolMe Signups */}
      <div className="dashboard-section">
        <h2>Recent UnschoolMe Signups</h2>
        {unschoolLoading ? (
          <p className="empty-message">Loading…</p>
        ) : unschoolSignups.length === 0 ? (
          <p className="empty-message">No signups yet</p>
        ) : (
          <div className="table-container">
            <table className="pipeline-table unschool-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {unschoolSignups.map((row, i) => {
                  const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email || 'Unknown';
                  const date = row.created_at ? new Date(row.created_at).toLocaleDateString() : '—';
                  return (
                    <tr key={row.id || i}>
                      <td className="stage-cell">{name}</td>
                      <td>{row.email}</td>
                      <td><span className="role-tag">{row.type || 'learner'}</span></td>
                      <td>{date}</td>
                      <td><span className="unschool-badge">UnschoolMe</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="dashboard-section charts-section">
        <h2>Analytics Overview</h2>
        <div className="charts-grid">
          {/* Круговая диаграмма */}
          <div className="chart-card">
            <h3>Customer Distribution</h3>
            <div className="pie-chart-container">
              {totalCustomers > 0 ? (
                <svg viewBox="0 0 100 100" className="pie-chart-svg">
                  {leadPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#ffd700"
                      strokeWidth="20"
                      strokeDasharray={`${leadPercent * 2.51} 251`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  )}
                  {prospectPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#87ceeb"
                      strokeWidth="20"
                      strokeDasharray={`${prospectPercent * 2.51} 251`}
                      strokeDashoffset={-leadPercent * 2.51}
                      transform="rotate(-90 50 50)"
                    />
                  )}
                  {activePercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#90ee90"
                      strokeWidth="20"
                      strokeDasharray={`${activePercent * 2.51} 251`}
                      strokeDashoffset={-(leadPercent + prospectPercent) * 2.51}
                      transform="rotate(-90 50 50)"
                    />
                  )}
                  {vipPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#dda0dd"
                      strokeWidth="20"
                      strokeDasharray={`${vipPercent * 2.51} 251`}
                      strokeDashoffset={-(leadPercent + prospectPercent + activePercent) * 2.51}
                      transform="rotate(-90 50 50)"
                    />
                  )}
                  <circle cx="50" cy="50" r="30" fill="var(--card-bg)" className="pie-center-circle" />
                  <text x="50" y="54" textAnchor="middle" className="pie-center-text">
                    {totalCustomers}
                  </text>
                </svg>
              ) : (
                <div className="empty-pie-chart">
                  <span>No data</span>
                </div>
              )}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="color-dot" style={{ backgroundColor: '#ffd700' }}></span>
                <span>Lead ({customersByStatus.Lead})</span>
              </div>
              <div className="legend-item">
                <span className="color-dot" style={{ backgroundColor: '#87ceeb' }}></span>
                <span>Prospect ({customersByStatus.Prospect})</span>
              </div>
              <div className="legend-item">
                <span className="color-dot" style={{ backgroundColor: '#90ee90' }}></span>
                <span>Active ({customersByStatus.Active})</span>
              </div>
              <div className="legend-item">
                <span className="color-dot" style={{ backgroundColor: '#dda0dd' }}></span>
                <span>VIP ({customersByStatus.VIP})</span>
              </div>
            </div>
          </div>

          {/* Столбчатая диаграмма */}
          <div className="chart-card">
            <h3>Money by Status</h3>
            <div className="bar-chart">
              <div className="bar-container">
                <div className="bar-label">Lead</div>
                <div className="bar-wrapper">
                  <div className="bar" style={{ 
                    width: `${getMoneyPercentage(getMoneyByStatus('Lead'))}%`,
                    backgroundColor: '#ffd700'
                  }}>
                    <span className="bar-value">{formatMoney(getMoneyByStatus('Lead'))}</span>
                  </div>
                </div>
              </div>
              <div className="bar-container">
                <div className="bar-label">Prospect</div>
                <div className="bar-wrapper">
                  <div className="bar" style={{ 
                    width: `${getMoneyPercentage(getMoneyByStatus('Prospect'))}%`,
                    backgroundColor: '#87ceeb'
                  }}>
                    <span className="bar-value">{formatMoney(getMoneyByStatus('Prospect'))}</span>
                  </div>
                </div>
              </div>
              <div className="bar-container">
                <div className="bar-label">Active</div>
                <div className="bar-wrapper">
                  <div className="bar" style={{ 
                    width: `${getMoneyPercentage(getMoneyByStatus('Active'))}%`,
                    backgroundColor: '#90ee90'
                  }}>
                    <span className="bar-value">{formatMoney(getMoneyByStatus('Active'))}</span>
                  </div>
                </div>
              </div>
              <div className="bar-container">
                <div className="bar-label">VIP</div>
                <div className="bar-wrapper">
                  <div className="bar" style={{ 
                    width: `${getMoneyPercentage(getMoneyByStatus('VIP'))}%`,
                    backgroundColor: '#dda0dd'
                  }}>
                    <span className="bar-value">{formatMoney(getMoneyByStatus('VIP'))}</span>
                  </div>
                </div>
              </div>
            </div>
            {totalMoney === 0 && (
              <p className="empty-chart-note">Add deals to see money distribution</p>
            )}
          </div>

          {/* Статистика */}
          <div className="chart-card stats-card">
            <h3>Quick Stats</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span>Average per customer:</span>
                <strong>{formatMoney(totalMoney / (totalCustomers || 1))}</strong>
              </div>
              <div className="stat-row">
                <span>Conversion rate:</span>
                <strong>{totalCustomers > 0 ? Math.round(((customersByStatus.Active + customersByStatus.VIP) / totalCustomers) * 100) : 0}%</strong>
              </div>
              <div className="stat-row">
                <span>Active ratio:</span>
                <strong>{totalCustomers > 0 ? Math.round((customersByStatus.Active / totalCustomers) * 100) : 0}%</strong>
              </div>
              <div className="stat-row">
                <span>VIP ratio:</span>
                <strong>{totalCustomers > 0 ? Math.round((customersByStatus.VIP / totalCustomers) * 100) : 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href = '/customers'}>
            ➕ Add Customer
          </button>
          <button className="action-btn" onClick={() => setShowCalendarModal(true)}>
            📅 Schedule Meeting
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/reports'}>
            📊 Generate Report
          </button>
          <button className="action-btn" onClick={() => setShowNewsletterModal(true)}>
            ✉️ Send Newsletter
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Schedule Meeting</h2>
              <button className="close-btn" onClick={() => setShowCalendarModal(false)}>✕</button>
            </div>
            <div className="modal-content" style={{ padding: '1rem 0' }}>
              <Calendar 
                onEventCreated={() => setShowCalendarModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Modal */}
      {showNewsletterModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <Newsletter onClose={() => setShowNewsletterModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

