import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSound } from './SoundManager';
import './Calendar.css';

const Calendar = ({ customer, onEventCreated }) => {
  const { currentUser } = useAuth();
  
  // Инициализируем events прямо из localStorage при создании state
  const [events, setEvents] = useState(() => {
    if (!currentUser) {
      console.log('❌ No current user, initializing empty array');
      return [];
    }
    const saved = localStorage.getItem(`calendar_events_${currentUser.id}`);
    console.log('📥 Initial load from localStorage:', saved);
    return saved ? JSON.parse(saved) : [];
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'meeting',
    customerId: customer?.id,
    customerName: customer?.name
  });

  const { addNotification } = useNotifications();
  const { playSound } = useSound();

  // Сохраняем события при каждом изменении
  useEffect(() => {
    if (currentUser) {
      console.log('💾 Saving to localStorage (effect):', events);
      localStorage.setItem(`calendar_events_${currentUser.id}`, JSON.stringify(events));
      
      // Проверяем сразу что сохранилось
      const saved = localStorage.getItem(`calendar_events_${currentUser.id}`);
      console.log('🔍 Verified saved data:', saved);
    }
  }, [events, currentUser]);

  // Получить дни месяца
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Проверка есть ли события в этот день
  const getDayEvents = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  // Создать событие
  const createEvent = () => {
    console.log('=== 🎯 CREATING EVENT ===');
    console.log('Current user:', currentUser);
    console.log('Event data:', eventData);
    
    if (!eventData.title || !eventData.date || !eventData.time) {
      console.log('❌ Missing required fields');
      addNotification({
        title: '❌ Error',
        message: 'Please fill all required fields',
        icon: '⚠️',
        type: 'error'
      });
      playSound('error');
      return;
    }

    if (!currentUser) {
      console.log('❌ No current user, cannot save');
      addNotification({
        title: '❌ Error',
        message: 'You must be logged in',
        icon: '⚠️',
        type: 'error'
      });
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...eventData,
      createdAt: new Date().toISOString(),
      dateTime: new Date(`${eventData.date}T${eventData.time}`).toISOString()
    };

    console.log('➕ New event object:', newEvent);
    console.log('📊 Current events before:', events);
    
    // СОХРАНЯЕМ В LOCALSTORAGE ПРЯМО СЕЙЧАС
    const updatedEvents = [...events, newEvent];
    console.log('📊 Updated events:', updatedEvents);
    
    console.log('💾 Saving immediately to localStorage...');
    localStorage.setItem(`calendar_events_${currentUser.id}`, JSON.stringify(updatedEvents));
    
    // Проверяем что сохранилось
    const saved = localStorage.getItem(`calendar_events_${currentUser.id}`);
    console.log('🔍 Verified after save:', saved);
    
    // Обновляем состояние
    setEvents(updatedEvents);
    
    setShowEventModal(false);
    
    addNotification({
      title: '📅 Event Created',
      message: `${eventData.title} scheduled for ${eventData.date}`,
      icon: '✅',
      type: 'success'
    });
    
    // Пробуем звук с задержкой
    setTimeout(() => {
      playSound('success');
    }, 100);

    setEventData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      type: 'meeting',
      customerId: customer?.id,
      customerName: customer?.name
    });

    if (onEventCreated) onEventCreated(newEvent);
  };

  // Удалить событие
  const deleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== id);
      
      if (currentUser) {
        localStorage.setItem(`calendar_events_${currentUser.id}`, JSON.stringify(updatedEvents));
      }
      
      setEvents(updatedEvents);
      
      addNotification({
        title: '🗑️ Event Deleted',
        message: 'Event has been removed',
        icon: '🗑️',
        type: 'delete'
      });
      playSound('delete');
    }
  };

  const days = getMonthDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
        >
          ←
        </button>
        <h2>
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </h2>
        <button 
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, index) => {
          const dayEvents = date ? getDayEvents(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

          return (
            <div 
              key={index} 
              className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => date && setSelectedDate(date)}
            >
              {date && (
                <>
                  <span className="day-number">{date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div className="day-events">
                      <span className="event-indicator">{dayEvents.length}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="selected-date-events">
          <div className="events-header">
            <h3>
              Events for {selectedDate.toLocaleDateString()}
            </h3>
            <button 
              className="add-event-btn"
              onClick={() => {
                setEventData({
                  ...eventData,
                  date: selectedDate.toISOString().split('T')[0],
                  time: '12:00',
                  title: customer ? `Meeting with ${customer.name}` : 'New Event'
                });
                setShowEventModal(true);
              }}
            >
              + Add Event
            </button>
          </div>

          <div className="events-list">
            {getDayEvents(selectedDate).length > 0 ? (
              getDayEvents(selectedDate).map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-time">{event.time}</div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-type">
                      {event.type === 'meeting' && '📅'}
                      {event.type === 'call' && '📞'}
                      {event.type === 'email' && '✉️'}
                      {event.type === 'task' && '✅'}
                      {event.type === 'reminder' && '⏰'}
                      {' ' + event.type}
                    </div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                  </div>
                  <button 
                    className="event-delete"
                    onClick={() => deleteEvent(event.id)}
                    title="Delete event"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="no-events">
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal calendar-modal">
            <div className="modal-header">
              <h2>Schedule Event</h2>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select
                value={eventData.type}
                onChange={(e) => setEventData({...eventData, type: e.target.value})}
              >
                <option value="meeting">📅 Meeting</option>
                <option value="call">📞 Call</option>
                <option value="email">✉️ Email</option>
                <option value="task">✅ Task</option>
                <option value="reminder">⏰ Reminder</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
                placeholder="Event title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                placeholder="Event description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Date *</label>
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData({...eventData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group half">
                <label>Time *</label>
                <input
                  type="time"
                  value={eventData.time}
                  onChange={(e) => setEventData({...eventData, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <select
                value={eventData.duration}
                onChange={(e) => setEventData({...eventData, duration: parseInt(e.target.value)})}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {customer && (
              <div className="form-group">
                <label>Customer</label>
                <input
                  type="text"
                  value={customer.name}
                  disabled
                  className="disabled-input"
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={createEvent}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;