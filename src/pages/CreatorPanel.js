import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './CreatorPanel.css';

const CreatorPanel = () => {
  // ===== ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ЗДЕСЬ, ДО ЛЮБЫХ УСЛОВИЙ =====
  const [password, setPassword] = useState('');
  const [access, setAccess] = useState(false);
  const SECRET_PASSWORD = 'Spo2009!2009';

  // Получаем пользователей из AuthContext
  const { users } = useAuth();

  // Загружаем всех клиентов
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  });

  // Загружаем все сделки из Pipeline
  const [pipelineStages, setPipelineStages] = useState(() => {
    const saved = localStorage.getItem('pipelineStages');
    return saved ? JSON.parse(saved) : [];
  });

  // Загружаем настройки
  const [generalSettings, setGeneralSettings] = useState(() => {
    const saved = localStorage.getItem('generalSettings');
    return saved ? JSON.parse(saved) : { companyName: 'My CRM' };
  });

  // Статистика использования
  const [usageStats, setUsageStats] = useState({
    totalCustomers: 0,
    totalDeals: 0,
    totalMoney: 0,
    activeUsers: 0,
    lastActive: new Date().toLocaleString()
  });

  // Реальные данные для графиков
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [customerGrowthData, setCustomerGrowthData] = useState([]);
  const [dealGrowthData, setDealGrowthData] = useState([]);
  const [stageDistribution, setStageDistribution] = useState([]);

  // Цвета для графиков
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  // Считаем статистику и генерируем данные для графиков ТОЛЬКО из реальных данных
  useEffect(() => {
    const totalMoney = customers.reduce((sum, c) => sum + (parseFloat(c.deals) || 0), 0);
    const totalDeals = pipelineStages.reduce((sum, s) => sum + s.deals.length, 0);

    setUsageStats({
      totalCustomers: customers.length,
      totalDeals: totalDeals,
      totalMoney: totalMoney,
      activeUsers: users.length,
      lastActive: new Date().toLocaleString()
    });

    // ===== РЕАЛЬНЫЙ ГРАФИК РОСТА ПОЛЬЗОВАТЕЛЕЙ =====
    if (users.length > 0) {
      // Сортируем пользователей по дате
      const sortedUsers = [...users].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Создаем данные для графика с накоплением
      let cumulative = 0;
      const growthData = sortedUsers.map(user => {
        cumulative += 1;
        return {
          date: formatDate(user.createdAt),
          totalUsers: cumulative,
          newUsers: 1
        };
      });
      
      setUserGrowthData(growthData);
    } else {
      setUserGrowthData([]);
    }

    // ===== РЕАЛЬНЫЙ ГРАФИК РОСТА КЛИЕНТОВ =====
    if (customers.length > 0) {
      // Сортируем клиентов по дате
      const sortedCustomers = [...customers].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      let cumulative = 0;
      const customerData = sortedCustomers.map(customer => {
        cumulative += 1;
        return {
          date: formatDate(customer.createdAt),
          totalCustomers: cumulative,
          newCustomers: 1
        };
      });
      
      setCustomerGrowthData(customerData);
    } else {
      setCustomerGrowthData([]);
    }

    // ===== РЕАЛЬНЫЙ ГРАФИК РОСТА СДЕЛОК =====
    const allDeals = pipelineStages.flatMap(stage => 
      stage.deals.map(deal => ({
        ...deal,
        stageName: stage.name,
        date: new Date().toLocaleDateString() // В реальности тут должна быть дата создания сделки
      }))
    );

    if (allDeals.length > 0) {
      const sortedDeals = [...allDeals].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      let cumulative = 0;
      const dealData = sortedDeals.map(deal => {
        cumulative += 1;
        return {
          date: formatDate(deal.date),
          totalDeals: cumulative,
          newDeals: 1
        };
      });
      
      setDealGrowthData(dealData);
    } else {
      setDealGrowthData([]);
    }

    // ===== РЕАЛЬНОЕ РАСПРЕДЕЛЕНИЕ ПО ЭТАПАМ =====
    const stageData = pipelineStages
      .filter(stage => stage.deals.length > 0)
      .map(stage => ({
        name: stage.name,
        value: stage.deals.length,
        color: stage.color
      }));
    setStageDistribution(stageData);

  }, [customers, pipelineStages, users]);

  // Форматирование денег
  const formatMoney = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount/1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount/1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  // Получение цвета для статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'Lead': return '#ffd700';
      case 'Prospect': return '#87ceeb';
      case 'Active': return '#90ee90';
      case 'VIP': return '#dda0dd';
      default: return '#ccc';
    }
  };

  // ===== УСЛОВИЕ ДОСТУПА =====
  if (!access) {
    return (
      <div className="creator-login">
        <div className="login-box">
          <h2>🔒 Creator Access Only</h2>
          <p>Enter password to continue</p>
          <input 
            type="password" 
            placeholder="Enter secret password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && password === SECRET_PASSWORD && setAccess(true)}
          />
          <button 
            onClick={() => password === SECRET_PASSWORD && setAccess(true)}
            className="login-btn"
          >
            <span>Enter</span>
          </button>
          {password && password !== SECRET_PASSWORD && (
            <p className="error-message">❌ Wrong password!</p>
          )}
        </div>
      </div>
    );
  }

  // ===== ОСНОВНОЙ ИНТЕРФЕЙС =====
  return (
    <div className="creator-panel">
      {/* Шапка */}
      <div className="creator-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="back-btn"
            title="Go back to Dashboard"
          >
            <span className="back-icon">←</span>
            <span className="back-text">Back</span>
          </button>
          <h1>👑 Creator Panel</h1>
        </div>
        <div className="creator-badge">Admin Access</div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card creator-stat">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p className="stat-value">{usageStats.totalCustomers}</p>
          </div>
        </div>

        <div className="stat-card creator-stat">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Money</h3>
            <p className="stat-value">{formatMoney(usageStats.totalMoney)}</p>
          </div>
        </div>

        <div className="stat-card creator-stat">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Active Deals</h3>
            <p className="stat-value">{usageStats.totalDeals}</p>
          </div>
        </div>

        <div className="stat-card creator-stat">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
      </div>

      {/* ===== ГРАФИКИ НА РЕАЛЬНЫХ ДАННЫХ ===== */}
      {(users.length > 0 || customers.length > 0 || usageStats.totalDeals > 0) && (
        <div className="charts-section">
          <h2>📊 Real-time Statistics</h2>
          
          <div className="charts-grid">
            {/* График роста пользователей */}
            {users.length > 0 && userGrowthData.length > 0 && (
              <div className="chart-card">
                <h3>👥 User Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-color)" />
                    <YAxis stroke="var(--text-color)" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalUsers" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="chart-note">Total: {users.length} users</p>
              </div>
            )}

            {/* График роста клиентов */}
            {customers.length > 0 && customerGrowthData.length > 0 && (
              <div className="chart-card">
                <h3>👤 Customer Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-color)" />
                    <YAxis stroke="var(--text-color)" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalCustomers" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total Customers"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="chart-note">Total: {customers.length} customers</p>
              </div>
            )}

            {/* График роста сделок */}
            {usageStats.totalDeals > 0 && dealGrowthData.length > 0 && (
              <div className="chart-card">
                <h3>💼 Deal Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dealGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-color)" />
                    <YAxis stroke="var(--text-color)" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalDeals" 
                      stroke="#FF8042" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Total Deals"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="chart-note">Total: {usageStats.totalDeals} deals</p>
              </div>
            )}

            {/* Круговая диаграмма распределения по этапам */}
            {stageDistribution.length > 0 && (
              <div className="chart-card">
                <h3>🥧 Pipeline Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {stageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Сообщение если нет данных */}
      {users.length === 0 && customers.length === 0 && usageStats.totalDeals === 0 && (
        <div className="empty-state">
          <p>No data yet. Statistics will appear when users start using the CRM.</p>
        </div>
      )}

      {/* Таблица пользователей */}
      {users.length > 0 && (
        <div className="database-section">
          <h2>👥 Registered Users</h2>
          <div className="table-card">
            <div className="table-header">
              <h3>Users Table</h3>
              <span className="record-count">{users.length} users</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.company || '-'}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(user.lastActive).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Таблица клиентов */}
      {customers.length > 0 && (
        <div className="database-section">
          <h2>👤 Customers</h2>
          <div className="table-card">
            <div className="table-header">
              <h3>Customers Table</h3>
              <span className="record-count">{customers.length} customers</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Deals</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>#{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.company}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(customer.status) }}>
                          {customer.status}
                        </span>
                      </td>
                      <td>{formatMoney(customer.deals)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="export-section">
        <h2>📤 Export Data</h2>
        <div className="export-buttons">
          <button 
            className="export-btn"
            onClick={() => {
              const dataStr = JSON.stringify(localStorage, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = 'crm-backup.json';
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
          >
            ⬇️ Download Full Backup
          </button>
          
          {customers.length > 0 && (
            <button 
              className="export-btn"
              onClick={() => {
                const customersStr = JSON.stringify(customers, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(customersStr);
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', 'customers-backup.json');
                linkElement.click();
              }}
            >
              👥 Download Customers
            </button>
          )}

          {users.length > 0 && (
            <button 
              className="export-btn"
              onClick={() => {
                const usersStr = JSON.stringify(users, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(usersStr);
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', 'users-backup.json');
                linkElement.click();
              }}
            >
              👤 Download Users
            </button>
          )}

          <button 
            className="export-btn danger"
            onClick={() => {
              if (window.confirm('⚠️ Clear ALL data? This cannot be undone!')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            🗑️ Reset All Data
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="system-info">
        <h3>🖥️ System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Browser:</span>
            <span>{navigator.userAgent}</span>
          </div>
          <div className="info-item">
            <span className="info-label">LocalStorage Size:</span>
            <span>{Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorPanel;
