import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import { getSession, clearSession } from '../utils/storage';
import '../App.css';

function MenuPanolero() {
  const navigate = useNavigate();
  const [panolero, setPanolero] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setPanolero(session);
    } else {
      setPanolero({ nombre: 'Administrador', apellido: 'Pañol', cargo: 'ADMINISTRADOR' });
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  if (!panolero) return null;

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <main className="main-card">
        <HamburgerMenu />
        
        <header className="welcome-header">
          <h1>Menú Principal</h1>
          <p>Pañolero Activo: {panolero.nombre} {panolero.apellido}</p>
        </header>

        <div className="menu-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="button" 
            className="action-btn retiro-btn" 
            onClick={() => navigate('/retiro')}
            style={{ width: '100%' }}
          >
            Registrar Retiro
          </button>
          <button 
            type="button" 
            className="action-btn devolucion-btn" 
            onClick={() => navigate('/devolucion')}
            style={{ width: '100%' }}
          >
            Registrar Devolución
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            type="button" 
            className="logout-btn" 
            onClick={handleLogout}
            style={{ width: '100%', maxWidth: '250px' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}

export default MenuPanolero;
