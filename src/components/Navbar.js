import React, { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useApiKey();

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
          <div className="api-key-section">
            <label htmlFor="openai-api-key">OpenAI API Key</label>
            <input
              id="openai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
          </div>
        </div>
      </nav>
      {isOpen && <div className="navbar-overlay" onClick={toggleNavbar}></div>}
    </>
  );
};

export default Navbar; 