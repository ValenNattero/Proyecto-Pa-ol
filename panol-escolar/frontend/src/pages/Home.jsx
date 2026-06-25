import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, saveSession, clearSession } from '../utils/storage';
import logoImg from '../../IMG/Logo Ciclo basico.jpeg';
import '../App.css';

const CARGOS = [
  "ESTUDIANTE DE PRIMERO PRIMERA",
  "ESTUDIANTE DE PRIMERO SEGUNDA",
  "ESTUDIANTE DE PRIMERO TERCERA",
  "ESTUDIANTE DE PRIMERO CUARTA",
  "ESTUDIANTE - SEGUNDO PRIMERA",
  "ESTUDIANTE - SEGUNDO SEGUNDA",
  "ESTUDIANTE - SEGUNDO TERCERA",
  "ESTUDIANTE - SEGUNDO CUARTA",
  "ESTUDIANTE - TERCERO PRIMERA",
  "ESTUDIANTE - TERCERO SEGUNDA",
  "ESTUDIANTE - TERCERO TERCERA",
  "ESTUDIANTE - TERCERO CUARTA",
  "ESTUDIANTE - CUARTO PRIMERA",
  "ESTUDIANTE - CUARTO SEGUNDA",
  "ESTUDIANTE - CUARTO TERCERA",
  "ESTUDIANTE - CUARTO CUARTA",
  "ESTUDIANTE - QUINTO PRIMERA",
  "ESTUDIANTE - QUINTO SEGUNDA",
  "ESTUDIANTE - QUINTO TERCERA",
  "ESTUDIANTE - QUINTO CUARTA",
  "ESTUDIANTE - SEXTO PRIMERA",
  "ESTUDIANTE - SEXTO SEGUNDA",
  "ESTUDIANTE - SEXTO TERCERA",
  "ESTUDIANTE - SEXTO CUARTA",
  "ESTUDIANTE - SEPTIMO PRIMERA",
  "ESTUDIANTE - SEPTIMO SEGUNDA",
  "ESTUDIANTE - SEPTIMO TERCERA",
  "ESTUDIANTE - SEPTIMO CUARTA",
  "DOCENTE",
  "PERSONAL MANTENIMIENTO",
  "PERSONAL FUERZA AEREA",
  "PERSONAL BUFFET"
];

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cargo: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Admin states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    const session = getSession();
    if (session) {
      setFormData(session);
      setIsSessionActive(true);
    }
  }, []);
  
  const handleAdminAccess = () => {
    setShowAdminModal(true);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser === 'admin' && adminPass === 'admin') {
      setShowAdminModal(false);
      navigate('/admin');
    } else {
      setAdminError('Credenciales incorrectas');
    }
  };

  const handleInputChange = (e) => {
    if (isSessionActive) return; // Prevent changing if session is locked
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Buscando: ", searchQuery);
  };

  const handleRetiro = (e) => {
    e.preventDefault();
    if (!isSessionActive && !e.target.form.reportValidity()) return;
    saveSession(formData);
    navigate('/retiro', { state: { usuario: formData } });
  };

  const handleDevolucion = (e) => {
    e.preventDefault();
    if (!isSessionActive && !e.target.form.reportValidity()) return;
    saveSession(formData);
    navigate('/devolucion', { state: { usuario: formData } });
  };

  const handleLogout = () => {
    clearSession();
    setIsSessionActive(false);
    setFormData({ nombre: '', apellido: '', cargo: '' });
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>

      <main className="main-card">
        <header className="welcome-header">
          <h1>Bienvenidos</h1>
          <p>Sistema de gestión Pañol Escolar</p>
        </header>

        <form className="search-section" onSubmit={handleSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscador rápido de herramientas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <form className="form-section">
          <h2>
            {isSessionActive ? "Sesión Activa" : "Ingreso Pañoleros"}
          </h2>
          {isSessionActive && <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Tus datos están guardados temporalmente.</p>}
          
          <div className="input-group">
            <label htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              placeholder="Ej. Juan" 
              value={formData.nombre}
              onChange={handleInputChange}
              required 
              disabled={isSessionActive}
            />
          </div>

          <div className="input-group">
            <label htmlFor="apellido">Apellido</label>
            <input 
              type="text" 
              id="apellido" 
              name="apellido" 
              placeholder="Ej. Pérez" 
              value={formData.apellido}
              onChange={handleInputChange}
              required 
              disabled={isSessionActive}
            />
          </div>

          <div className="input-group">
            <label htmlFor="cargo">Cargo</label>
            <select 
              id="cargo" 
              name="cargo" 
              value={formData.cargo}
              onChange={handleInputChange}
              required
              disabled={isSessionActive}
            >
              <option value="" disabled>Seleccione un cargo...</option>
              {CARGOS.map((cargo, index) => (
                <option key={index} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>

          <div className="actions-section">
            <button type="button" className="action-btn retiro-btn" onClick={handleRetiro}>Retiro</button>
            <button type="button" className="action-btn devolucion-btn" onClick={handleDevolucion}>Devolución</button>
          </div>

          {isSessionActive && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="logout-btn" 
                onClick={handleLogout}
                style={{ width: '100%', maxWidth: '250px' }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </form>
      </main>

      {/* Logo oculto con doble clic para admin */}
      <div className="footer-logo" onDoubleClick={handleAdminAccess} title="Doble clic para admin">
        <img src={logoImg} alt="Logo Ciclo Básico" className="school-logo" />
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Acceso Administrador</h2>
            <form onSubmit={handleAdminLogin} className="admin-form">
              <input 
                type="text" 
                placeholder="Usuario" 
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                autoFocus
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
              {adminError && <p className="error-text">{adminError}</p>}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAdminModal(false)}>Cancelar</button>
                <button type="submit" className="login-btn">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
