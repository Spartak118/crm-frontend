import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ConfirmModal from '../components/ConfirmModal';
import ReminderModal from '../components/ReminderModal';
import ExportImport from '../components/ExportImport';
import Calendar from '../components/Calendar';
import RequireAuth from '../components/RequireAuth';
import './Customers.css';

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

const Customers = () => {
  const { currentUser, userData, updateUserCustomers } = useAuth();
  const { addNotification } = useNotifications();
  
  // Загружаем данные пользователя
  const [customers, setCustomers] = useState(() => {
    return userData?.customers || [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead',
    deals: ''
  });

  // Сохраняем изменения
  useEffect(() => {
    if (currentUser) {
      updateUserCustomers(customers);
    }
  }, [customers, currentUser, updateUserCustomers]);

  // Функция для импорта клиентов
  const handleImportCustomers = (newCustomers) => {
    const updatedCustomers = [...customers];
    let newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    
    newCustomers.forEach(customer => {
      const newCustomer = {
        ...customer,
        id: newId++,
        lastContact: new Date().toISOString().split('T')[0]
      };
      updatedCustomers.push(newCustomer);
    });
    
    setCustomers(updatedCustomers);
    
    addNotification({
      title: '📥 Import Successful',
      message: `${newCustomers.length} customers imported`,
      icon: '🎉',
      type: 'success'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch(status) {
      case 'VIP': return 'status-vip';
      case 'Active': return 'status-active';
      case 'Lead': return 'status-lead';
      case 'Prospect': return 'status-prospect';
      default: return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'Lead',
      deals: ''
    });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company,
      status: customer.status,
      deals: customer.deals || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id, name) => {
    setCustomerToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      setShowSuccessMessage(`Customer "${customerToDelete.name}" deleted successfully`);
      
      addNotification({
        title: '🗑️ Customer Deleted',
        message: `Customer "${customerToDelete.name}" has been removed`,
        icon: '🗑️',
        type: 'delete'
      });
      
      setTimeout(() => setShowSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleReminderClick = (customer) => {
    setSelectedCustomer(customer);
    setShowReminderModal(true);
  };

  const handleCalendarClick = (customer) => {
    setSelectedCustomer(customer);
    setShowCalendarModal(true);
  };

  const handleAddSuccess = () => {
    setShowSuccessMessage('Customer added successfully!');
    
    addNotification({
      title: '🎉 New Customer Added',
      message: `Customer "${formData.name}" has been added to your list`,
      icon: '🎉',
      type: 'success'
    });
    
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleEditSuccess = () => {
    setShowSuccessMessage('Customer updated successfully!');
    
    addNotification({
      title: '✏️ Customer Updated',
      message: `Customer "${formData.name}" has been updated`,
      icon: '✏️',
      type: 'update'
    });
    
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dealAmount = parseMoneyInput(formData.deals);
    
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { 
              ...formData, 
              id: c.id, 
              lastContact: new Date().toISOString().split('T')[0],
              deals: dealAmount
            }
          : c
      ));
      handleEditSuccess();
    } else {
      const newCustomer = {
        ...formData,
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        lastContact: new Date().toISOString().split('T')[0],
        deals: dealAmount
      };
      setCustomers([...customers, newCustomer]);
      handleAddSuccess();
    }
    
    setShowModal(false);
  };

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
    
    addNotification({
      title: '📧 Email Client Opened',
      message: `Email client opened for ${email}`,
      icon: '📧',
      type: 'email'
    });
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
    
    addNotification({
      title: '📞 Call Initiated',
      message: `Calling ${phone}`,
      icon: '📞',
      type: 'call'
    });
  };

  return (
    <RequireAuth>
      <div className="customers-page">
        {showSuccessMessage && (
          <div className="success-message">{showSuccessMessage}</div>
        )}

        <div className="page-header">
          <h1>Customers</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ExportImport 
              customers={customers} 
              onImport={handleImportCustomers}
              type="customers"
            />
            <button className="btn-primary" onClick={openAddModal}>+ Add Customer</button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          {customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers yet</p>
              <button className="btn-primary" onClick={openAddModal}>Add your first customer</button>
            </div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Last Contact</th>
                  <th>Deals ($)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.company}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>{customer.lastContact}</td>
                    <td className="money-cell">{formatMoney(customer.deals)}</td>
                    <td>
                      <button className="btn-icon" onClick={() => openEditModal(customer)} title="Edit">✏️</button>
                      <button className="btn-icon" onClick={() => handleEmail(customer.email)} title="Email">📧</button>
                      <button className="btn-icon" onClick={() => handleCall(customer.phone)} title="Call">📞</button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDeleteClick(customer.id, customer.name)} 
                        title="Delete"
                      >🗑️</button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleReminderClick(customer)} 
                        title="Set Reminder"
                      >⏰</button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleCalendarClick(customer)} 
                        title="Schedule Meeting"
                      >📅</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Deal Amount ($)</label>
                  <input
                    type="text"
                    name="deals"
                    value={formData.deals}
                    onChange={handleInputChange}
                    placeholder="Enter amount (e.g., 1000, 1.5K, 2M, 1B)"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCustomer ? 'Update' : 'Add'} Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          message={customerToDelete ? `Are you sure you want to delete "${customerToDelete.name}"?` : ''}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />

        <ReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          customerName={selectedCustomer?.name}
          customerId={selectedCustomer?.id}
        />

        {/* Calendar Modal */}
        {showCalendarModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Schedule Meeting with {selectedCustomer?.name}</h2>
                <button className="close-btn" onClick={() => setShowCalendarModal(false)}>✕</button>
              </div>
              <div className="modal-content" style={{ padding: '1rem 0' }}>
                <Calendar 
                  customer={selectedCustomer}
                  onEventCreated={() => setShowCalendarModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
};

export default Customers;