import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SoundProvider } from './components/SoundManager';
import { AutomationProvider } from './contexts/AutomationContext';
import SoundControls from './components/SoundControls';
import NotificationBell from './components/NotificationBell';
import ConfirmModal from './components/ConfirmModal';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Pipeline from './pages/Pipeline';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CustomerDetail from './pages/CustomerDetail';
import CreatorPanel from './pages/CreatorPanel';
import Automation from './pages/Automation';
import Login from './pages/Login';
import Register from './pages/Register';
import Logo from './components/Logo';

// Google Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Navigation component with improved mobile menu
const Navigation = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Закрываем меню при смене страницы
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Проверка активной ссылки
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav>
        {/* Левая часть - логотип */}
        <div className="nav-left">
          <Logo />
        </div>

        {/* Десктопное меню по центру */}
        <div className="desktop-menu nav-center">
          <a href="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</a>
          <a href="/customers" className={isActive('/customers') ? 'active' : ''}>Customers</a>
          <a href="/pipeline" className={isActive('/pipeline') ? 'active' : ''}>Pipeline</a>
          <a href="/reports" className={isActive('/reports') ? 'active' : ''}>Reports</a>
          <a href="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</a>
          <a href="/automation" className={`nav-link ${isActive('/automation') ? 'active' : ''}`}>⚡ Automation</a>
          <a href="/creator" className={`creator-link ${isActive('/creator') ? 'active' : ''}`}>👑 Creator</a>
        </div>

        {/* Правая часть - кнопки */}
        <div className="nav-right">
          {currentUser && <NotificationBell />}
          <SoundControls />
          
          {/* Имя пользователя (десктоп) */}
          {currentUser && (
            <span className="desktop-menu user-name">
              👤 {currentUser.name}
            </span>
          )}
          
          {/* Кнопка Logout (десктоп) */}
          {currentUser && (
            <button onClick={handleLogoutClick} className="auth-nav-btn desktop-menu">
              Logout
            </button>
          )}

          {/* Кнопки для неавторизованных (десктоп) */}
          {!currentUser && (
            <div className="desktop-menu auth-buttons">
              <a href="/login" className="auth-nav-btn">Login</a>
              <a href="/register" className="auth-nav-btn register">Sign Up</a>
            </div>
          )}
          
          {/* Кнопка темы */}
          <button onClick={toggleTheme} className="theme-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Бургер кнопка */}
          <button 
            className={`burger-btn mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <>
            <div className="menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="mobile-side-menu">
              <div className="mobile-menu-header">
                <div className="mobile-menu-title">
                  <span className="mobile-menu-icon">☰</span>
                  <span>Menu</span>
                </div>
                <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
              </div>
              
              {/* Информация о пользователе в мобильном меню */}
              <div className="mobile-user-section">
                {currentUser ? (
                  <div className="mobile-user-details">
                    <div className="mobile-user-avatar">👤</div>
                    <div className="mobile-user-text">
                      <span className="mobile-user-name">{currentUser.name}</span>
                      <span className="mobile-user-email">{currentUser.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mobile-guest">
                    <span className="guest-avatar">👤</span>
                    <span>Guest User</span>
                  </div>
                )}
              </div>

              {/* Навигационные ссылки */}
              <div className="mobile-menu-items">
                <a 
                  href="/dashboard" 
                  className={`mobile-menu-item ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">📊</span>
                  <span className="menu-item-text">Dashboard</span>
                </a>
                <a 
                  href="/customers" 
                  className={`mobile-menu-item ${isActive('/customers') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">👥</span>
                  <span className="menu-item-text">Customers</span>
                </a>
                <a 
                  href="/pipeline" 
                  className={`mobile-menu-item ${isActive('/pipeline') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">📈</span>
                  <span className="menu-item-text">Pipeline</span>
                </a>
                <a 
                  href="/reports" 
                  className={`mobile-menu-item ${isActive('/reports') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">📋</span>
                  <span className="menu-item-text">Reports</span>
                </a>
                <a 
                  href="/settings" 
                  className={`mobile-menu-item ${isActive('/settings') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">⚙️</span>
                  <span className="menu-item-text">Settings</span>
                </a>
                <a 
                  href="/automation" 
                  className={`mobile-menu-item ${isActive('/automation') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">⚡</span>
                  <span className="menu-item-text">Automation</span>
                </a>
                
                <div className="mobile-menu-divider"></div>
                
                <a 
                  href="/creator" 
                  className={`mobile-menu-item creator-item ${isActive('/creator') ? 'active' : ''}`}
                >
                  <span className="menu-item-icon">👑</span>
                  <span className="menu-item-text">Creator Panel</span>
                </a>
              </div>

              {/* Кнопки для неавторизованных */}
              {!currentUser && (
                <div className="mobile-auth-section">
                  <a href="/login" className="mobile-login-btn">Login</a>
                  <a href="/register" className="mobile-signup-btn">Sign Up</a>
                </div>
              )}

              {/* Кнопка Logout для авторизованных */}
              {currentUser && (
                <div className="mobile-logout-section">
                  <button onClick={handleLogoutClick} className="mobile-logout-btn">
                    <span className="logout-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Футер с темой */}
              <div className="mobile-menu-footer">
                <button onClick={toggleTheme} className="mobile-theme-btn">
                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      <ConfirmModal
        isOpen={showLogoutModal}
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="logout"
      />
    </>
  );
};

// Wrapper component to use location
const AppContentWrapper = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

function AppContent() {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/creator" element={<CreatorPanel />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <SoundProvider>
            <NotificationProvider>
              <AutomationProvider>
                <AppContentWrapper />
              </AutomationProvider>
            </NotificationProvider>
          </SoundProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;