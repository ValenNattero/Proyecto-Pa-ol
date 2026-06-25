import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/storage';

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Buscando desde menú: ", searchQuery);
    // Acá implementaremos la búsqueda real después
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="hamburger-container">
      <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menú">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isOpen && (
        <div className="hamburger-dropdown">
          <form className="hamburger-search" onSubmit={handleSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar herramienta..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
