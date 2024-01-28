import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logo.css';
import { ReactComponent as LogoSVG } from '../logo.svg'; // Adjust the path as necessary

const Logo = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleLogoClick = () => {
    navigate('/'); // Navigate to home page (root)
  };

  return (
    <div className="logo-container" onClick={handleLogoClick}>
      <LogoSVG className="logo-svg" />
    </div>
  );
};

export default Logo;
