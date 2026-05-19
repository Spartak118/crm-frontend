import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSound } from '../components/SoundManager';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { playSound } = useSound();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Загружаем уведомления пользователя
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`notifications_${currentUser.id}`);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        // Создаем тестовые уведомления для нового пользователя
        const demoNotifications = [
          {
            id: 1,
            type: 'welcome',
            title: 'Welcome to CRM! 👋',
            message: 'Thanks for joining. Start by adding your first customer.',
            time: new Date().toISOString(),
            read: false,
            icon: '🎉'
          },
          {
            id: 2,
            type: 'tip',
            title: 'Pro Tip 💡',
            message: 'You can drag and drop deals in the Pipeline view!',
            time: new Date().toISOString(),
            read: false,
            icon: '💡'
          }
        ];
        setNotifications(demoNotifications);
        localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(demoNotifications));
      }
    }
  }, [currentUser]);

  // Обновляем счетчик непрочитанных
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Сохраняем при изменениях
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  // Добавить уведомление
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      time: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Играем звук в зависимости от типа уведомления
    switch(notification.type) {
      case 'success':
      case 'welcome':
        playSound('success');
        break;
      case 'reminder':
      case 'alert':
        playSound('reminder');
        break;
      case 'error':
      case 'missed':
        playSound('error');
        break;
      case 'complete':
        playSound('complete');
        break;
      default:
        playSound('noti');
    }
    
    // Показываем браузерное уведомление если разрешено
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
  };

  // Отметить как прочитанное
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Отметить все как прочитанные
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Удалить уведомление
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Очистить все
  const clearAll = () => {
    setNotifications([]);
    if (currentUser) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify([]));
    }
  };

  // Запросить разрешение на уведомления
  const requestPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }
  };

  // Проверка сохраненных напоминаний при загрузке
  useEffect(() => {
    if (currentUser) {
      // Проверяем все напоминания при запуске
      const checkReminders = () => {
        const allReminders = [];
        // Собираем все напоминания из localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('reminders_')) {
            try {
              const reminders = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(reminders)) {
                allReminders.push(...reminders);
              }
            } catch (e) {
              console.error('Error parsing reminders:', e);
            }
          }
        }

        const now = new Date();
        
        allReminders.forEach(reminder => {
          if (!reminder.completed && reminder.datetime) {
            const reminderTime = new Date(reminder.datetime);
            const timeUntil = reminderTime - now;
            
            // Если напоминание должно быть сейчас или в ближайшие 5 минут
            if (timeUntil > 0 && timeUntil < 300000) {
              setTimeout(() => {
                addNotification({
                  title: `⏰ Upcoming ${reminder.type || 'reminder'}`,
                  message: `${reminder.type || 'Reminder'} with ${reminder.customerName || 'customer'} in ${Math.round(timeUntil / 60000)} minutes`,
                  icon: '🔔',
                  type: 'reminder'
                });
              }, timeUntil);
            }
            
            // Если напоминание просрочено (меньше дня)
            if (timeUntil < 0 && Math.abs(timeUntil) < 86400000) {
              addNotification({
                title: `⚠️ Missed ${reminder.type || 'reminder'}`,
                message: `You missed a ${reminder.type || 'reminder'} with ${reminder.customerName || 'customer'}`,
                icon: '⚠️',
                type: 'missed'
              });
            }
          }
        });
      };

      checkReminders();
      
      // Проверяем каждую минуту
      const interval = setInterval(checkReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};