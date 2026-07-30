import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './DesktopNav.css';

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If we are on the home page, we might want to hide the buttons or just the home button
  const isHome = location.pathname === '/';

  return (
    <div className="desktop-nav-container">
      <button 
        className="nav-btn" 
        onClick={() => navigate(-1)}
        disabled={isHome}
        title="Volver atrás"
      >
        <ArrowLeft size={28} />
      </button>
      <button 
        className="nav-btn" 
        onClick={() => navigate('/')}
        disabled={isHome}
        title="Ir a inicio"
      >
        <Home size={28} />
      </button>
    </div>
  );
};

export default DesktopNav;
