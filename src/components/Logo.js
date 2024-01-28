import React from 'react';
import './Logo.css';
import { ReactComponent as LogoSVG } from '../logo.svg'; // Adjust the path as necessary

const Logo = () => {
  return (
    <div className="logo-container">
      <LogoSVG className="logo-svg" />
    </div>
  );
};

export default Logo;
