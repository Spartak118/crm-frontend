import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // Загружаем данные текущего пользователя
  const [userData, setUserData] = useState(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`userData_${currentUser.id}`);
      return saved ? JSON.parse(saved) : {
        customers: [],
        pipelineStages: [
          { id: 1, name: 'Lead', color: '#ffd700', deals: [] },
          { id: 2, name: 'Prospect', color: '#87ceeb', deals: [] },
          { id: 3, name: 'Opportunity', color: '#98fb98', deals: [] },
          { id: 4, name: 'Customer', color: '#90ee90', deals: [] },
          { id: 5, name: 'VIP', color: '#dda0dd', deals: [] }
        ],
        settings: { companyName: 'My CRM', timezone: 'UTC-5', dateFormat: 'MM/DD/YYYY', currency: 'USD', autoSave: true }
      };
    }
    return null;
  });

  // Сохраняем пользователей
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Сохраняем текущего пользователя
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Сохраняем данные текущего пользователя
  useEffect(() => {
    if (currentUser && userData) {
      localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(userData));
    }
  }, [currentUser, userData]);

  // Функция регистрации
  const register = (userData) => {
    setLoading(true);
    
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      setLoading(false);
      return false;
    }

    const newUser = {
      id: users.length + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      company: userData.company || '',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      role: 'user',
      status: 'active'
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    
    // Создаем пустые данные для нового пользователя
    const newUserData = {
      customers: [],
      pipelineStages: [
        { id: 1, name: 'Lead', color: '#ffd700', deals: [] },
        { id: 2, name: 'Prospect', color: '#87ceeb', deals: [] },
        { id: 3, name: 'Opportunity', color: '#98fb98', deals: [] },
        { id: 4, name: 'Customer', color: '#90ee90', deals: [] },
        { id: 5, name: 'VIP', color: '#dda0dd', deals: [] }
      ],
      settings: { companyName: 'My CRM', timezone: 'UTC-5', dateFormat: 'MM/DD/YYYY', currency: 'USD', autoSave: true }
    };
    
    setUserData(newUserData);
    localStorage.setItem(`userData_${newUser.id}`, JSON.stringify(newUserData));
    
    setLoading(false);
    return true;
  };

  // Функция входа
  const login = (email, password) => {
    setLoading(true);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (email === 'admin@crm.com' && password === 'password123') {
      const demoUser = {
        id: 0,
        name: 'Admin',
        email: 'admin@crm.com',
        role: 'admin',
        status: 'active',
        lastActive: new Date().toISOString()
      };
      setCurrentUser(demoUser);
      
      // Загружаем данные админа
      const adminData = localStorage.getItem('userData_0') ? 
        JSON.parse(localStorage.getItem('userData_0')) : {
          customers: [],
          pipelineStages: [
            { id: 1, name: 'Lead', color: '#ffd700', deals: [] },
            { id: 2, name: 'Prospect', color: '#87ceeb', deals: [] },
            { id: 3, name: 'Opportunity', color: '#98fb98', deals: [] },
            { id: 4, name: 'Customer', color: '#90ee90', deals: [] },
            { id: 5, name: 'VIP', color: '#dda0dd', deals: [] }
          ],
          settings: { companyName: 'Admin CRM', timezone: 'UTC-5', dateFormat: 'MM/DD/YYYY', currency: 'USD', autoSave: true }
        };
      setUserData(adminData);
      
      setLoading(false);
      return true;
    }
    
    if (user) {
      setCurrentUser(user);
      // Обновляем lastActive
      setUsers(users.map(u => 
        u.id === user.id 
          ? {...u, lastActive: new Date().toISOString()} 
          : u
      ));
      
      // Загружаем данные пользователя
      const savedUserData = localStorage.getItem(`userData_${user.id}`);
      if (savedUserData) {
        setUserData(JSON.parse(savedUserData));
      } else {
        // Если нет данных, создаем новые
        const newUserData = {
          customers: [],
          pipelineStages: [
            { id: 1, name: 'Lead', color: '#ffd700', deals: [] },
            { id: 2, name: 'Prospect', color: '#87ceeb', deals: [] },
            { id: 3, name: 'Opportunity', color: '#98fb98', deals: [] },
            { id: 4, name: 'Customer', color: '#90ee90', deals: [] },
            { id: 5, name: 'VIP', color: '#dda0dd', deals: [] }
          ],
          settings: { companyName: 'My CRM', timezone: 'UTC-5', dateFormat: 'MM/DD/YYYY', currency: 'USD', autoSave: true }
        };
        setUserData(newUserData);
        localStorage.setItem(`userData_${user.id}`, JSON.stringify(newUserData));
      }
      
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  // Функция выхода
  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
  };

  // Функции для работы с данными пользователя
  const updateUserCustomers = (newCustomers) => {
    if (currentUser) {
      const updatedData = { ...userData, customers: newCustomers };
      setUserData(updatedData);
      localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(updatedData));
    }
  };

  const updateUserPipeline = (newPipeline) => {
    if (currentUser) {
      const updatedData = { ...userData, pipelineStages: newPipeline };
      setUserData(updatedData);
      localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(updatedData));
    }
  };

  const updateUserSettings = (newSettings) => {
    if (currentUser) {
      const updatedData = { ...userData, settings: newSettings };
      setUserData(updatedData);
      localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(updatedData));
    }
  };

  const value = {
    users,
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    updateUserCustomers,
    updateUserPipeline,
    updateUserSettings,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};