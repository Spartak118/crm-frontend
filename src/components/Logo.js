import React from 'react';
import './Logo.css';
import visolaroLogo from '../images/VISOLARO.png';  // ← новый импорт

const Logo = () => {
  return (
    <div className="logo-wrapper">
      <div className="logo-container">
        <img src={visolaroLogo} alt="VISOLARO" className="logo-image" />
      </div>
      <div className="logo-text">
        <span className="logo-name">VISOLARO</span>
        <span className="logo-crm">CRM</span>
      </div>
    </div>
  );
};

export default Logo;