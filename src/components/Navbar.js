import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="navbar-toggle" onClick={toggleNavbar}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <nav className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-content">
          {/* Content will be added here later */}
        </div>
      </nav>
      {isOpen && <div className="navbar-overlay" onClick={toggleNavbar}></div>}
    </>
  );
};

export default Navbar; 