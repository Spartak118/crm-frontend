import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import './ReminderModal.css';

const ReminderModal = ({ isOpen, onClose, customerName, customerId }) => {
  const { addNotification } = useNotifications();
  const [reminderData, setReminderData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reminderDateTime = new Date(`${reminderData.date}T${reminderData.time}`);
    
    // Создаем напоминание
    const reminder = {
      id: Date.now(),
      title: reminderData.title || `${reminderData.type} with ${customerName}`,
      message: `${reminderData.type} scheduled for ${reminderData.date} at ${reminderData.time}. ${reminderData.notes}`,
      datetime: reminderDateTime.toISOString(),
      type: reminderData.type,
      customerId,
      customerName,
      completed: false
    };

    // Сохраняем в localStorage
    const savedReminders = localStorage.getItem(`reminders_${customerId}`) || '[]';
    const reminders = JSON.parse(savedReminders);
    reminders.push(reminder);
    localStorage.setItem(`reminders_${customerId}`, JSON.stringify(reminders));

    // Добавляем уведомление
    addNotification({
      title: '📅 Reminder Set',
      message: `${reminderData.type} with ${customerName} on ${reminderData.date}`,
      icon: '⏰',
      type: 'reminder'
    });

    // Устанавливаем таймер для уведомления
    const now = new Date();
    const timeUntilReminder = reminderDateTime - now;
    
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        addNotification({
          title: `⏰ ${reminderData.type} Reminder`,
          message: `You have a ${reminderData.type} with ${customerName} now!`,
          icon: '🔔',
          type: 'alert'
        });
      }, timeUntilReminder);
    }

    onClose();
    alert('Reminder set successfully!');
  };

  return (
    <div className="reminder-modal-overlay">
      <div className="reminder-modal">
        <div className="reminder-modal-header">
          <h2>Set Reminder</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reminder Type</label>
            <select
              value={reminderData.type}
              onChange={(e) => setReminderData({...reminderData, type: e.target.value})}
              required
            >
              <option value="meeting">📅 Meeting</option>
              <option value="call">📞 Call</option>
              <option value="email">✉️ Email</option>
              <option value="task">✅ Task</option>
              <option value="followup">🔄 Follow-up</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title (optional)</label>
            <input
              type="text"
              placeholder="e.g., Project discussion"
              value={reminderData.title}
              onChange={(e) => setReminderData({...reminderData, title: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Date *</label>
              <input
                type="date"
                value={reminderData.date}
                onChange={(e) => setReminderData({...reminderData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group half">
              <label>Time *</label>
              <input
                type="time"
                value={reminderData.time}
                onChange={(e) => setReminderData({...reminderData, time: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows="3"
              placeholder="Additional details..."
              value={reminderData.notes}
              onChange={(e) => setReminderData({...reminderData, notes: e.target.value})}
            />
          </div>

          <div className="reminder-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;