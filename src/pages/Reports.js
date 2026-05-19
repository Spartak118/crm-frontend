import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import RequireAuth from '../components/RequireAuth';
import './Reports.css';

const Reports = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [dateRange, setDateRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [isLoading, setIsLoading] = useState(false);

  // Все данные = 0 (пустые)
  const [reportData, setReportData] = useState({
    sales: {
      revenue: 0,
      deals: 0,
      avgDealSize: 0,
      winRate: 0
    },
    customers: {
      new: 0,
      active: 0,
      churn: 0,
      lifetime: 0
    },
    pipeline: {
      leads: 0,
      conversion: 0,
      value: 0,
      cycle: 0
    },
    team: {
      topPerformer: 'None',
      topAmount: 0,
      avgCalls: 0,
      meetings: 0,
      tasks: 0
    }
  });

  const reports = [
    { id: 'sales', title: 'Sales Performance', icon: '📊', color: '#667eea' },
    { id: 'customers', title: 'Customer Analytics', icon: '👥', color: '#48bb78' },
    { id: 'pipeline', title: 'Pipeline Health', icon: '📈', color: '#fbbf24' },
    { id: 'team', title: 'Team Performance', icon: '👤', color: '#f56565' }
  ];

  // Загружаем реальные данные из CRM
  useEffect(() => {
    if (currentUser) {
      // Здесь потом подключим реальные данные
      loadRealData();
    }
  }, [currentUser, dateRange, selectedReport]);

  const loadRealData = () => {
    setIsLoading(true);
    
    // TODO: Загрузить реальные данные из customers и pipeline
    // Пока все = 0
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    addNotification({
      title: '📅 Date Range Changed',
      message: `Showing ${range} data`,
      icon: '📊',
      type: 'info'
    });
  };

  const handleExport = () => {
    addNotification({
      title: '📥 Export Started',
      message: 'Your report is being prepared',
      icon: '📊',
      type: 'info'
    });
  };

  const handleShare = () => {
    addNotification({
      title: '🔗 Share Link Generated',
      message: 'Report link copied to clipboard',
      icon: '✅',
      type: 'success'
    });
  };

  const formatMoney = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount/1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount/1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const getMetricValue = (metric) => {
    switch(metric) {
      case 'revenue': return formatMoney(reportData.sales.revenue);
      case 'deals': return reportData.sales.deals;
      case 'avgDealSize': return formatMoney(reportData.sales.avgDealSize);
      case 'winRate': return `${reportData.sales.winRate}%`;
      case 'newCustomers': return reportData.customers.new;
      case 'activeCustomers': return reportData.customers.active;
      case 'churnRate': return `${reportData.customers.churn}%`;
      case 'lifetime': return `${reportData.customers.lifetime} mo`;
      case 'leads': return reportData.pipeline.leads;
      case 'conversion': return `${reportData.pipeline.conversion}%`;
      case 'pipelineValue': return formatMoney(reportData.pipeline.value);
      case 'cycle': return `${reportData.pipeline.cycle} days`;
      case 'topPerformer': return reportData.team.topPerformer;
      case 'topAmount': return formatMoney(reportData.team.topAmount);
      case 'avgCalls': return reportData.team.avgCalls;
      case 'meetings': return reportData.team.meetings;
      default: return '0';
    }
  };

  return (
    <RequireAuth>
      <div className="reports-page">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Header с градиентом */}
        <div className="reports-header">
          <div className="header-content">
            <h1>Reports & Analytics</h1>
            <p>Track your business performance in real-time</p>
          </div>
          <div className="header-actions">
            <button className="header-btn export-btn" onClick={handleExport}>
              <span className="btn-icon">📥</span>
              Export
            </button>
            <button className="header-btn share-btn" onClick={handleShare}>
              <span className="btn-icon">🔗</span>
              Share
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="date-range-wrapper">
          <div className="date-range-buttons">
            <button 
              className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
              onClick={() => handleDateRangeChange('week')}
            >
              Week
            </button>
            <button 
              className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
              onClick={() => handleDateRangeChange('month')}
            >
              Month
            </button>
            <button 
              className={`range-btn ${dateRange === 'quarter' ? 'active' : ''}`}
              onClick={() => handleDateRangeChange('quarter')}
            >
              Quarter
            </button>
            <button 
              className={`range-btn ${dateRange === 'year' ? 'active' : ''}`}
              onClick={() => handleDateRangeChange('year')}
            >
              Year
            </button>
          </div>
          <div className="date-range-custom">
            <button className="custom-date-btn">
              <span>📅</span>
              Custom Range
            </button>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="report-cards">
          {reports.map(report => (
            <button
              key={report.id}
              className={`report-card ${selectedReport === report.id ? 'active' : ''}`}
              onClick={() => setSelectedReport(report.id)}
              style={{ '--card-color': report.color }}
            >
              <span className="card-icon">{report.icon}</span>
              <span className="card-title">{report.title}</span>
              {selectedReport === report.id && (
                <span className="card-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Main Metrics Grid - Все 0 */}
        <div className="metrics-grid">
          {selectedReport === 'sales' && (
            <>
              <div className="metric-card large">
                <div className="metric-icon">💰</div>
                <div className="metric-info">
                  <span className="metric-label">Total Revenue</span>
                  <span className="metric-value">{getMetricValue('revenue')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-info">
                  <span className="metric-label">Deals Closed</span>
                  <span className="metric-value">{getMetricValue('deals')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">💵</div>
                <div className="metric-info">
                  <span className="metric-label">Avg. Deal Size</span>
                  <span className="metric-value">{getMetricValue('avgDealSize')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-info">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value">{getMetricValue('winRate')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
            </>
          )}

          {selectedReport === 'customers' && (
            <>
              <div className="metric-card large">
                <div className="metric-icon">👥</div>
                <div className="metric-info">
                  <span className="metric-label">Active Customers</span>
                  <span className="metric-value">{getMetricValue('activeCustomers')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">✨</div>
                <div className="metric-info">
                  <span className="metric-label">New Customers</span>
                  <span className="metric-value">{getMetricValue('newCustomers')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📉</div>
                <div className="metric-info">
                  <span className="metric-label">Churn Rate</span>
                  <span className="metric-value">{getMetricValue('churnRate')}</span>
                  <span className="metric-change">0%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⏳</div>
                <div className="metric-info">
                  <span className="metric-label">Avg. Lifetime</span>
                  <span className="metric-value">{getMetricValue('lifetime')}</span>
                  <span className="metric-change">0</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Section - Графики для примера, но без данных */}
        <div className="charts-section">
          <h2 className="section-title">Performance Overview</h2>
          <div className="charts-grid">
            {/* Revenue Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Revenue Trend</h3>
                <select className="chart-select">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="chart-container">
                <div className="empty-chart-message">
                  <p>No data available</p>
                  <span>Add customers and deals to see trends</span>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Deal Distribution</h3>
                <span className="chart-badge">By Stage</span>
              </div>
              <div className="chart-container">
                <div className="empty-chart-message">
                  <p>No deals yet</p>
                  <span>Create deals in Pipeline to see distribution</span>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Team Performance</h3>
                <span className="chart-badge">Monthly Goals</span>
              </div>
              <div className="chart-container">
                <div className="empty-chart-message">
                  <p>No team data</p>
                  <span>Add team members in Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table - Пустая */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">Recent Deals</h2>
            <div className="table-actions">
              <button className="table-action-btn">
                <span>🔍</span>
                Search
              </button>
              <button className="table-action-btn">
                <span>📊</span>
                Filter
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Value</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Close Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="empty-table-message">
                    <div className="empty-state">
                      <span className="empty-icon">📊</span>
                      <p>No deals yet</p>
                      <button 
                        className="btn-primary"
                        onClick={() => window.location.href = '/pipeline'}
                      >
                        Add your first deal
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default Reports;