import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const STORAGE_KEY = 'openai_api_key';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [apiKey]);

  const toggleNavbar = (): void => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    setApiKey(e.target.value);
    // Restore cursor position after state update
    requestAnimationFrame(() => {
      if (cursorPosition !== null && input) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
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
              ref={inputRef}
              id="openai-api-key"
              type="text"
              value={apiKey}
              onChange={handleInputChange}
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