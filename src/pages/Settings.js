import React, { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'My CRM',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    autoSave: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    newCustomer: true,
    dealStageChange: true,
    taskCompleted: true,
    newTeamMember: false
  });

  // Team Members
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Doe', role: 'Admin', email: 'john@company.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', role: 'Sales Rep', email: 'jane@company.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', role: 'Sales Rep', email: 'bob@company.com', status: 'Inactive' }
  ]);

  // Integrations
  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Google Calendar', status: 'Connected', icon: '📅' },
    { id: 2, name: 'Slack', status: 'Disconnected', icon: '💬' },
    { id: 3, name: 'Mailchimp', status: 'Connected', icon: '✉️' },
    { id: 4, name: 'Stripe', status: 'Disconnected', icon: '💳' }
  ]);

  // Billing
  const [billing, setBilling] = useState({
    plan: 'Professional',
    status: 'Active',
    nextBilling: '2024-03-15',
    amount: '$49.99',
    paymentMethod: 'Visa ending in 4242'
  });

  // Security
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  const [saveMessage, setSaveMessage] = useState('');

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'team', name: 'Team', icon: '👥' },
    { id: 'integrations', name: 'Integrations', icon: '🔌' },
    { id: 'billing', name: 'Billing', icon: '💰' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ];

  // Save functions
  const handleSaveGeneral = () => {
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
    setSaveMessage('General settings saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    setSaveMessage('Notification settings saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleInviteMember = () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      alert(`Invitation sent to ${email}`);
    }
  };

  const handleEditMember = (member) => {
    const newRole = prompt(`Change role for ${member.name}:`, member.role);
    if (newRole) {
      setTeamMembers(teamMembers.map(m => 
        m.id === member.id ? {...m, role: newRole} : m
      ));
      setShowSuccessMessage(`Role updated for ${member.name}`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  // NEW: Delete with modal
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      setTeamMembers(teamMembers.filter(m => m.id !== memberToDelete.id));
      setShowSuccessMessage(`Team member "${memberToDelete.name}" removed successfully`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const handleToggleIntegration = (id) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? {...integration, status: integration.status === 'Connected' ? 'Disconnected' : 'Connected'}
        : integration
    ));
    const integration = integrations.find(i => i.id === id);
    setShowSuccessMessage(`${integration.name} ${integration.status === 'Connected' ? 'disconnected' : 'connected'}`);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleSaveSecurity = () => {
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (security.newPassword && security.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    setSaveMessage('Security settings saved!');
    setSecurity({...security, currentPassword: '', newPassword: '', confirmPassword: ''});
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          {showSuccessMessage}
        </div>
      )}

      {saveMessage && <div className="save-message">{saveMessage}</div>}

      <div className="settings-container">
        {/* Левая панель с тонкими кнопками */}
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Правая панель с контентом */}
        <div className="settings-content">
          {/* GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="setting-item">
                <label>Company Name</label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                />
              </div>

              <div className="setting-item">
                <label>Timezone</label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                >
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC-6">UTC-6 (CST)</option>
                  <option value="UTC-7">UTC-7 (MST)</option>
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC+1">UTC+1 (CET)</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Date Format</label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Currency</label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={generalSettings.autoSave}
                    onChange={(e) => setGeneralSettings({...generalSettings, autoSave: e.target.checked})}
                  />
                  Auto-save changes
                </label>
              </div>

              <div className="settings-footer">
                <button className="btn-primary" onClick={handleSaveGeneral}>Save Changes</button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                  />
                  Email Notifications
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.desktopNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, desktopNotifications: e.target.checked})}
                  />
                  Desktop Notifications
                </label>
              </div>

              <h3>Notify me about:</h3>
              
              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newCustomer}
                    onChange={(e) => setNotificationSettings({...notificationSettings, newCustomer: e.target.checked})}
                  />
                  New customer added
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dealStageChange}
                    onChange={(e) => setNotificationSettings({...notificationSettings, dealStageChange: e.target.checked})}
                  />
                  Deal stage changed
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.taskCompleted}
                    onChange={(e) => setNotificationSettings({...notificationSettings, taskCompleted: e.target.checked})}
                  />
                  Task completed
                </label>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newTeamMember}
                    onChange={(e) => setNotificationSettings({...notificationSettings, newTeamMember: e.target.checked})}
                  />
                  New team member
                </label>
              </div>

              <div className="settings-footer">
                <button className="btn-primary" onClick={handleSaveNotifications}>Save Changes</button>
              </div>
            </div>
          )}

          {/* TEAM SETTINGS */}
          {activeTab === 'team' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Team Management</h2>
                <button className="btn-primary" onClick={handleInviteMember}>+ Invite Member</button>
              </div>
              
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.role}</td>
                      <td>{member.email}</td>
                      <td>
                        <span className={`status-badge ${member.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => handleEditMember(member)} title="Edit">✏️</button>
                        <button className="btn-icon" onClick={() => handleDeleteClick(member)} title="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INTEGRATIONS SETTINGS */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Integrations</h2>
              
              {integrations.map(integration => (
                <div key={integration.id} className="integration-item">
                  <div className="integration-info">
                    <span className="integration-icon">{integration.icon}</span>
                    <span className="integration-name">{integration.name}</span>
                    <span className={`integration-status ${integration.status === 'Connected' ? 'connected' : 'disconnected'}`}>
                      {integration.status}
                    </span>
                  </div>
                  <button 
                    className={integration.status === 'Connected' ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => handleToggleIntegration(integration.id)}
                  >
                    {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BILLING SETTINGS */}
          {activeTab === 'billing' && (
            <div className="settings-section">
              <h2>Billing Information</h2>
              
              <div className="billing-card">
                <div className="billing-row">
                  <span className="billing-label">Current Plan:</span>
                  <span className="billing-value">{billing.plan}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Status:</span>
                  <span className="billing-value status-active">{billing.status}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Next Billing:</span>
                  <span className="billing-value">{billing.nextBilling}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Amount:</span>
                  <span className="billing-value">{billing.amount}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Payment Method:</span>
                  <span className="billing-value">{billing.paymentMethod}</span>
                </div>
              </div>

              <div className="billing-actions">
                <button className="btn-primary">Upgrade Plan</button>
                <button className="btn-secondary">Update Payment Method</button>
                <button className="btn-secondary">View Invoices</button>
              </div>
            </div>
          )}

          {/* SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="password-field">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                  <button 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    type="button"
                  >
                    {showPassword.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="password-field">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                  <button 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    type="button"
                  >
                    {showPassword.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="password-field">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                  <button 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    type="button"
                  >
                    {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={security.twoFactor}
                    onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                  />
                  Enable Two-Factor Authentication
                </label>
              </div>

              <div className="settings-footer">
                <button className="btn-primary" onClick={handleSaveSecurity}>Update Password</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        message={memberToDelete ? `Are you sure you want to remove "${memberToDelete.name}" from the team? This action cannot be undone.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Settings;