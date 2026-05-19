import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const AutomationContext = createContext();

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};

export const AutomationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [automations, setAutomations] = useState([]);
  const [triggerHistory, setTriggerHistory] = useState([]);

  // Загружаем автоматизации пользователя
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`automations_${currentUser.id}`);
      if (saved) {
        setAutomations(JSON.parse(saved));
      } else {
        // Создаем примеры автоматизаций
        const demoAutomations = [
          {
            id: 1,
            name: 'Welcome Notification',
            description: 'Send notification when new customer added',
            enabled: true,
            trigger: {
              type: 'customer.created',
              conditions: []
            },
            actions: [
              {
                type: 'notification.create',
                config: {
                  title: '👋 Welcome!',
                  message: 'New customer added to CRM',
                }
              }
            ]
          },
          {
            id: 2,
            name: 'VIP Alert',
            description: 'Notify when VIP customer added',
            enabled: true,
            trigger: {
              type: 'customer.created',
              conditions: [
                { field: 'status', operator: 'equals', value: 'VIP' }
              ]
            },
            actions: [
              {
                type: 'notification.create',
                config: {
                  title: '🌟 VIP Alert',
                  message: 'VIP customer was added!',
                }
              }
            ]
          },
          {
            id: 3,
            name: 'Daily Reminder',
            description: 'Daily reminder notification',
            enabled: true,
            trigger: {
              type: 'schedule',
              config: {
                frequency: 'daily',
                time: '09:00'
              }
            },
            actions: [
              {
                type: 'notification.create',
                config: {
                  title: '⏰ Daily Reminder',
                  message: 'Time to check your tasks!',
                }
              }
            ]
          }
        ];
        setAutomations(demoAutomations);
        localStorage.setItem(`automations_${currentUser.id}`, JSON.stringify(demoAutomations));
      }
    }
  }, [currentUser]);

  // Сохраняем автоматизации
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`automations_${currentUser.id}`, JSON.stringify(automations));
    }
  }, [automations, currentUser]);

  // Добавить автоматизацию
  const addAutomation = (automation) => {
    const newAutomation = {
      id: Date.now(),
      ...automation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAutomations([...automations, newAutomation]);
    addNotification({
      title: '⚡ Automation Created',
      message: `"${automation.name}" has been added`,
      icon: '⚡',
      type: 'success'
    });
    return newAutomation;
  };

  // Обновить автоматизацию
  const updateAutomation = (id, updates) => {
    setAutomations(automations.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
    addNotification({
      title: '✏️ Automation Updated',
      message: 'Changes saved successfully',
      icon: '✅',
      type: 'success'
    });
  };

  // Удалить автоматизацию
  const deleteAutomation = (id) => {
    setAutomations(automations.filter(a => a.id !== id));
    addNotification({
      title: '🗑️ Automation Deleted',
      message: 'Automation has been removed',
      icon: '🗑️',
      type: 'delete'
    });
  };

  // Включить/выключить
  const toggleAutomation = (id) => {
    setAutomations(automations.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  // Проверить условия
  const checkConditions = (conditions, data) => {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
      const value = data[condition.field];
      switch(condition.operator) {
        case 'equals': return value === condition.value;
        case 'not_equals': return value !== condition.value;
        case 'contains': return String(value).includes(condition.value);
        case 'greater_than': return value > condition.value;
        case 'less_than': return value < condition.value;
        case 'starts_with': return String(value).startsWith(condition.value);
        case 'ends_with': return String(value).endsWith(condition.value);
        default: return true;
      }
    });
  };

  // Выполнить действия
  const executeActions = async (actions, data) => {
    for (const action of actions) {
      // Задержка если указана
      if (action.config.delay) {
        await new Promise(resolve => setTimeout(resolve, action.config.delay * 1000));
      }

      switch(action.type) {
        case 'notification.create':
          addNotification({
            title: action.config.title || '⚡ Automation',
            message: action.config.message || 'Automation triggered',
            icon: '⚡',
            type: 'info'
          });
          break;

        case 'email.send':
          console.log('📧 Sending email:', action.config);
          addNotification({
            title: '📧 Email Ready',
            message: `Email would be sent: ${action.config.subject}`,
            icon: '📧',
            type: 'info'
          });
          break;

        case 'task.create':
          console.log('✅ Creating task:', action.config);
          addNotification({
            title: '✅ Task Created',
            message: `Task: ${action.config.title}`,
            icon: '✅',
            type: 'success'
          });
          break;

        case 'report.generate':
          console.log('📊 Generating report:', action.config);
          addNotification({
            title: '📊 Report Generated',
            message: `${action.config.type} report ready`,
            icon: '📊',
            type: 'success'
          });
          break;

        case 'webhook.call':
          console.log('🌐 Calling webhook:', action.config);
          break;

        default:
          console.log('Unknown action:', action.type);
      }

      // Логируем выполнение
      setTriggerHistory(prev => [{
        id: Date.now(),
        automationId: data._automationId,
        action: action.type,
        timestamp: new Date().toISOString(),
        data: data
      }, ...prev].slice(0, 50));
    }
  };

  // Триггер для события
  const trigger = async (event, data) => {
    console.log(`🎯 Trigger event: ${event}`, data);
    
    // Находим все включенные автоматизации с подходящим триггером
    const matchingAutomations = automations.filter(a => 
      a.enabled && a.trigger.type === event
    );

    console.log(`Found ${matchingAutomations.length} matching automations`);

    for (const automation of matchingAutomations) {
      console.log(`Checking automation: ${automation.name}`);
      
      // Проверяем условия
      if (checkConditions(automation.trigger.conditions || [], data)) {
        console.log(`✅ Conditions met, executing actions...`);
        await executeActions(automation.actions, {
          ...data,
          _automationId: automation.id,
          _triggeredAt: new Date().toISOString()
        });

        addNotification({
          title: `⚡ ${automation.name}`,
          message: `Automation triggered successfully`,
          icon: '⚡',
          type: 'success'
        });
      } else {
        console.log(`❌ Conditions not met`);
      }
    }
  };

  // Планировщик для проверки времени
  useEffect(() => {
    if (!currentUser) return;

    const checkScheduled = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentDate = now.getDate();

      console.log('⏰ Checking scheduled workflows at:', currentTime);
      console.log('Current automations:', automations.map(a => ({ 
        name: a.name, 
        enabled: a.enabled, 
        type: a.trigger.type,
        time: a.trigger.config?.time,
        frequency: a.trigger.config?.frequency
      })));

      automations.forEach(auto => {
        if (!auto.enabled) {
          console.log(`Workflow "${auto.name}" is disabled, skipping`);
          return;
        }
        
        if (auto.trigger.type !== 'schedule') {
          console.log(`Workflow "${auto.name}" is not schedule type (${auto.trigger.type}), skipping`);
          return;
        }

        const config = auto.trigger.config;
        if (!config) {
          console.log(`Workflow "${auto.name}" has no config, skipping`);
          return;
        }

        console.log(`Checking workflow "${auto.name}":`, {
          frequency: config.frequency,
          targetTime: config.time,
          currentTime: currentTime,
          targetDay: config.day,
          currentDay: currentDay,
          targetDate: config.day,
          currentDate: currentDate
        });

        let shouldRun = false;
        let reason = '';

        switch(config.frequency) {
          case 'daily':
            shouldRun = config.time === currentTime;
            reason = `daily: ${config.time} === ${currentTime}`;
            break;
          case 'weekly':
            // Конвертируем название дня в число
            const dayMap = { 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 };
            const targetDay = typeof config.day === 'string' ? dayMap[config.day.toLowerCase()] : config.day;
            shouldRun = targetDay === currentDay && config.time === currentTime;
            reason = `weekly: day ${targetDay} === ${currentDay}, time ${config.time} === ${currentTime}`;
            break;
          case 'monthly':
            shouldRun = config.day === currentDate && config.time === currentTime;
            reason = `monthly: date ${config.day} === ${currentDate}, time ${config.time} === ${currentTime}`;
            break;
          default:
            reason = `unknown frequency: ${config.frequency}`;
        }

        console.log(`📊 Workflow "${auto.name}": ${reason} = ${shouldRun}`);

        if (shouldRun) {
          console.log(`✅ Triggering scheduled workflow: ${auto.name}`);
          trigger('schedule', { 
            type: config.frequency, 
            time: currentTime,
            automationName: auto.name 
          });
        }
      });
    };

    // Проверяем каждую минуту
    const interval = setInterval(checkScheduled, 60000);
    
    // Проверяем сразу при загрузке
    checkScheduled();

    return () => clearInterval(interval);
  }, [automations, currentUser, trigger]);

  const value = {
    automations,
    triggerHistory,
    addAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    trigger
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
};