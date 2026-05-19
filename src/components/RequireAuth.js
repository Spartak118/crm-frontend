import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './RequireAuth.css';

const RequireAuth = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="require-auth-container">
        <div className="require-auth-card">
          <div className="lock-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to access this page</p>
          
          <div className="auth-buttons">
            <a href="/login" className="auth-btn-primary">
              Log In
            </a>
            <a href="/register" className="auth-btn-secondary">
              Sign Up
            </a>
          </div>

          <div className="auth-demo">
            <p>Demo credentials:</p>
            <p className="demo-credentials">admin@crm.com / password123</p>
          </div>

          <div className="auth-footer">
            <p>New to CRM? <a href="/register">Create an account</a></p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireAuth;