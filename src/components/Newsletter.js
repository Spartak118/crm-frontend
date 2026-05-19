import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSound } from './SoundManager';
import { sendEmail, sendBulkNewsletter } from '../services/EmailService';
import './Newsletter.css';

const Newsletter = ({ onClose }) => {
  const { currentUser, userData } = useAuth();
  const { addNotification } = useNotifications();
  const { playSound } = useSound();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [targetEmail, setTargetEmail] = useState('');
  
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    template: 'custom',
    recipients: 'all',
    scheduleDate: '',
    scheduleTime: '',
    priority: 'normal',
    trackOpens: true,
    trackClicks: true,
    personalization: true
  });

  useEffect(() => {
    if (userData?.customers) {
      setCustomers(userData.customers);
    }
  }, [userData]);

  const templates = {
    custom: {
      name: '✨ Custom',
      icon: '🎨',
      description: 'Create your own masterpiece',
      subject: '',
      content: ''
    },
    welcome: {
      name: '🚀 Welcome',
      icon: '👋',
      description: 'New customer welcome',
      subject: 'Welcome to VISOLARO!',
      content: 'Welcome to the future of CRM. We\'re excited to have you on board.'
    },
    promotion: {
      name: '💎 Exclusive',
      icon: '💎',
      description: 'VIP offers',
      subject: 'Exclusive offer for you',
      content: 'As a valued VISOLARO customer, we have something special for you.'
    },
    newsletter: {
      name: '📬 Update',
      icon: '📡',
      description: 'Monthly news',
      subject: 'VISOLARO Monthly Update',
      content: 'Discover what\'s new in the VISOLARO universe.'
    },
    birthday: {
      name: '🎂 Birthday',
      icon: '✨',
      description: 'Birthday wishes',
      subject: 'Happy Birthday! ✨',
      content: 'Wishing you a spectacular day from all of us at VISOLARO!'
    }
  };

  const getRecipientsList = () => {
    switch(newsletterData.recipients) {
      case 'vip': 
        return customers.filter(c => c.status === 'VIP');
      case 'active': 
        return customers.filter(c => c.status === 'Active');
      case 'lead': 
        return customers.filter(c => c.status === 'Lead');
      default: 
        return customers;
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    if (templateId !== 'custom' && templates[templateId]) {
      setNewsletterData({
        ...newsletterData,
        template: templateId,
        subject: templates[templateId].subject,
        content: templates[templateId].content
      });
    } else {
      setNewsletterData({
        ...newsletterData,
        template: 'custom',
        subject: '',
        content: ''
      });
    }
  };

  const handleSendEmail = async () => {
    if (!targetEmail) {
      addNotification({
        title: '❌ Error',
        message: 'Enter an email address',
        icon: '⚠️',
        type: 'error'
      });
      return;
    }

    if (!newsletterData.subject || !newsletterData.content) {
      addNotification({
        title: '❌ Error',
        message: 'Fill subject and content',
        icon: '⚠️',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmail(
        targetEmail,
        'Recipient',
        'newsletter',
        {
          subject: newsletterData.subject,
          content: newsletterData.content
        }
      );

      if (result.success) {
        addNotification({
          title: '✅ Email Sent',
          message: `Sent to ${targetEmail}`,
          icon: '📧',
          type: 'success'
        });
        playSound('success');
        
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      addNotification({
        title: '❌ Failed',
        message: error.message,
        icon: '⚠️',
        type: 'error'
      });
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const recipients = getRecipientsList();

  const audienceOptions = [
    { 
      value: 'all', 
      label: '🌌 All Connections', 
      count: customers.length,
      color: '#667eea',
      icon: '✦'
    },
    { 
      value: 'vip', 
      label: '👑 VISOLARO VIP', 
      count: customers.filter(c => c.status === 'VIP').length,
      color: '#fbbf24',
      icon: '👑'
    },
    { 
      value: 'active', 
      label: '⚡ Active Minds', 
      count: customers.filter(c => c.status === 'Active').length,
      color: '#34d399',
      icon: '⚡'
    },
    { 
      value: 'lead', 
      label: '🔮 Future Prospects', 
      count: customers.filter(c => c.status === 'Lead').length,
      color: '#60a5fa',
      icon: '🔮'
    }
  ];

  return (
    <div className="visolaro-modal">
      {/* Фоновые эффекты */}
      <div className="visolaro-backdrop"></div>
      <div className="visolaro-particles">
        <div className="particle" style={{ top: '10%', left: '10%' }}></div>
        <div className="particle" style={{ top: '20%', right: '20%' }}></div>
        <div className="particle" style={{ bottom: '30%', left: '30%' }}></div>
        <div className="particle" style={{ bottom: '40%', right: '40%' }}></div>
      </div>

      {/* Основное окно */}
      <div className="visolaro-window">
        {/* Хедер */}
        <div className="visolaro-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="header-icon">✦</div>
            <div>
              <h1>VISOLARO<span className="header-crm">CRM</span></h1>
              <p>Quantum Communication Protocol</p>
            </div>
          </div>
          <button className="visolaro-close" onClick={onClose}>
            <span>✕</span>
          </button>
        </div>

        {/* Навигационные шаги */}
        <div className="visolaro-steps">
          <div 
            className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
            onClick={() => setStep(1)}
          >
            <div className="step-indicator">
              <span className="step-number">01</span>
              <span className="step-label">Message</span>
            </div>
            <div className="step-progress"></div>
          </div>
          <div 
            className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
            onClick={() => setStep(2)}
          >
            <div className="step-indicator">
              <span className="step-number">02</span>
              <span className="step-label">Target</span>
            </div>
            <div className="step-progress"></div>
          </div>
          <div 
            className={`step-item ${step === 3 ? 'active' : ''}`}
            onClick={() => setStep(3)}
          >
            <div className="step-indicator">
              <span className="step-number">03</span>
              <span className="step-label">Launch</span>
            </div>
            <div className="step-progress"></div>
          </div>
        </div>

        {/* Контент */}
        <div className="visolaro-content">
          {/* Шаг 1: Создание сообщения */}
          {step === 1 && (
            <div className="content-panel fade-in">
              <div className="panel-glow"></div>
              
              <div className="templates-showcase">
                <h3>Message Templates</h3>
                <div className="template-grid">
                  {Object.entries(templates).map(([id, template]) => (
                    <button
                      key={id}
                      className={`template-unit ${selectedTemplate === id ? 'active' : ''}`}
                      onClick={() => handleTemplateChange(id)}
                    >
                      <div className="unit-glow"></div>
                      <span className="unit-icon">{template.icon}</span>
                      <span className="unit-name">{template.name}</span>
                      <span className="unit-desc">{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-fields">
                <div className="field-group">
                  <label>Recipient Email</label>
                  <div className="field-wrapper">
                    <input
                      type="email"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="destination@universe.com"
                      className="visolaro-input"
                    />
                    <div className="field-border"></div>
                  </div>
                </div>

                <div className="field-group">
                  <label>Subject Line</label>
                  <div className="field-wrapper">
                    <input
                      type="text"
                      value={newsletterData.subject}
                      onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                      placeholder="Enter transmission subject..."
                      className="visolaro-input"
                    />
                    <div className="field-border"></div>
                  </div>
                </div>

                <div className="field-group">
                  <label>Message Content</label>
                  <div className="field-wrapper">
                    <textarea
                      value={newsletterData.content}
                      onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
                      placeholder="Compose your message..."
                      rows="6"
                      className="visolaro-textarea"
                    />
                    <div className="field-border"></div>
                  </div>
                </div>
              </div>

              <div className="action-bar">
                <button 
                  className="visolaro-button primary"
                  onClick={() => setStep(2)}
                >
                  Continue to Targeting
                  <span className="button-icon">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Шаг 2: Выбор аудитории */}
          {step === 2 && (
            <div className="content-panel fade-in">
              <div className="panel-glow"></div>

              <div className="audience-overview">
                <div className="overview-card">
                  <span className="card-label">Total Contacts</span>
                  <span className="card-value">{customers.length}</span>
                </div>
                <div className="overview-card">
                  <span className="card-label">Selected</span>
                  <span className="card-value">{recipients.length}</span>
                </div>
                <div className="overview-card">
                  <span className="card-label">Reach</span>
                  <span className="card-value">✦</span>
                </div>
              </div>

              <div className="field-group">
                <label>Target Segment</label>
                <div className="visolaro-radio-group">
                  {audienceOptions.map(option => (
                    <label 
                      key={option.value} 
                      className={`visolaro-radio ${newsletterData.recipients === option.value ? 'active' : ''}`}
                      style={{ '--radio-color': option.color }}
                      onClick={() => setNewsletterData({...newsletterData, recipients: option.value})}
                    >
                      <input
                        type="radio"
                        name="recipients"
                        value={option.value}
                        checked={newsletterData.recipients === option.value}
                        onChange={(e) => setNewsletterData({...newsletterData, recipients: e.target.value})}
                      />
                      <div className="radio-content-wrapper">
                        <span className="radio-icon">{option.icon}</span>
                        <span className="radio-label">{option.label}</span>
                        <span className="radio-count">{option.count}</span>
                      </div>
                      <div className="radio-glow" style={{ background: `radial-gradient(circle, ${option.color}20, transparent 70%)` }}></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="recipient-preview">
                <h4>Selected Recipients</h4>
                <div className="preview-scroll">
                  {recipients.slice(0, 5).map(c => (
                    <div key={c.id} className="preview-entry">
                      <span className="entry-name">{c.name}</span>
                      <span className="entry-email">{c.email}</span>
                      <span className={`entry-status status-${c.status?.toLowerCase()}`}>{c.status}</span>
                    </div>
                  ))}
                  {recipients.length > 5 && (
                    <div className="preview-more">
                      + {recipients.length - 5} additional connections
                    </div>
                  )}
                </div>
              </div>

              <div className="action-bar">
                <button className="visolaro-button secondary" onClick={() => setStep(1)}>
                  <span className="button-icon">←</span> Back
                </button>
                <button className="visolaro-button primary" onClick={() => setStep(3)}>
                  Proceed to Launch <span className="button-icon">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Шаг 3: Запуск */}
          {step === 3 && (
            <div className="content-panel fade-in">
              <div className="panel-glow"></div>

              <div className="launch-interface">
                <div className="launch-summary">
                  <h3>Mission Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-row">
                      <span>Destination:</span>
                      <strong>{recipients.length} targets</strong>
                    </div>
                    <div className="summary-row">
                      <span>Subject:</span>
                      <strong>{newsletterData.subject || 'Untitled'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Template:</span>
                      <strong>{templates[selectedTemplate]?.name}</strong>
                    </div>
                  </div>
                </div>

                <div className="launch-options">
                  <h4>Transmission Settings</h4>
                  <label className="option-check">
                    <input
                      type="checkbox"
                      checked={newsletterData.trackOpens}
                      onChange={(e) => setNewsletterData({...newsletterData, trackOpens: e.target.checked})}
                    />
                    <span>Track when opened</span>
                  </label>
                  <label className="option-check">
                    <input
                      type="checkbox"
                      checked={newsletterData.trackClicks}
                      onChange={(e) => setNewsletterData({...newsletterData, trackClicks: e.target.checked})}
                    />
                    <span>Track link clicks</span>
                  </label>
                </div>

                <div className="test-transmission">
                  <h4>Test Transmission</h4>
                  <div className="test-field">
                    <input
                      type="email"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="test@domain.com"
                      className="visolaro-input"
                    />
                    <button 
                      className="visolaro-button test-btn"
                      onClick={handleSendEmail}
                      disabled={loading}
                    >
                      {loading ? '...' : 'Test'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="action-bar">
                <button className="visolaro-button secondary" onClick={() => setStep(2)}>
                  <span className="button-icon">←</span> Back
                </button>
                <button 
                  className="visolaro-button launch-btn" 
                  onClick={handleSendEmail}
                  disabled={loading}
                >
                  {loading ? 'Launching...' : '✦ Launch Transmission'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;