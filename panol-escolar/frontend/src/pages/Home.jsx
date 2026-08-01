import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, saveSession, clearSession } from '../utils/storage';
import logoImg from '../assets/logo-ciclo-basico.jpeg';
import ToolCardModal from '../components/ToolCardModal';
import { Search } from 'lucide-react';
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

  // Search states
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    clearSession();
    setIsSessionActive(false);
    setFormData({
      nombre: '',
      apellido: '',
      cargo: ''
    });
  }, []);
  
  const handleAdminAccess = () => {
    setShowAdminModal(true);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');

    const isSuperAdmin = (adminUser === 'SalvucciPablo' && adminPass === 'EEST4base');

    try {
      const params = new URLSearchParams();
      params.append('username', adminUser);
      params.append('password', adminPass);

      const response = await fetch('http://127.0.0.1:8000/auth/login/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (response.ok) {
        const data = await response.json();
        const adminData = {
          nombre: isSuperAdmin ? 'Pablo' : adminUser,
          apellido: isSuperAdmin ? 'Salvucci' : '',
          cargo: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMINISTRADOR',
          username: adminUser,
          isSuperAdmin: isSuperAdmin,
          token: data.access_token
        };
        saveSession(adminData);
        setIsSessionActive(true);
        setFormData(adminData);
        setShowAdminModal(false);
        navigate('/admin');
        return;
      }
    } catch (err) {
      console.error("Error al iniciar sesión admin:", err);
    }

    // Fallback offline o si la base de datos no fue iniciada aún
    if (isSuperAdmin) {
      const adminData = {
        nombre: 'Pablo',
        apellido: 'Salvucci',
        cargo: 'SUPER_ADMIN',
        username: 'SalvucciPablo',
        isSuperAdmin: true,
        token: 'superadmin-fallback-token'
      };
      saveSession(adminData);
      setIsSessionActive(true);
      setFormData(adminData);
      setShowAdminModal(false);
      navigate('/admin');
      return;
    }

    if (adminUser === 'admin' && adminPass === 'admin') {
      const adminData = {
        nombre: 'Administrador',
        apellido: 'Pañol',
        cargo: 'ADMINISTRADOR',
        username: 'admin',
        isSuperAdmin: false,
        token: 'admin-fallback-token'
      };
      saveSession(adminData);
      setIsSessionActive(true);
      setFormData(adminData);
      setShowAdminModal(false);
      navigate('/admin');
      return;
    }

    setAdminError('Usuario o contraseña incorrectos');
  };

  const handleInputChange = (e) => {
    if (isSessionActive) return; // Prevent changing if session is locked
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/herramientas/buscar?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        if (data.length === 1) {
          setSelectedTool(data[0]);
          setSearchResults([]);
        } else if (data.length === 0) {
          alert('No se encontraron herramientas con ese término.');
        }
      }
    } catch (err) {
      console.error("Error buscando herramienta", err);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setSearchResults([]);
  };

  const handleIngreso = async (e) => {
    e.preventDefault();
    if (!isSessionActive && !e.target.form.reportValidity()) return;
    
    if (!isSessionActive) {
      try {
        const response = await fetch('http://127.0.0.1:8000/auth/login/panolero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          saveSession({ ...formData, token: data.access_token });
          navigate('/menu');
        } else {
          alert('Error al iniciar sesión. Verifique los datos.');
        }
      } catch (err) {
        console.error("Error logging in", err);
        alert('Error de conexión con el servidor.');
      }
    } else {
      saveSession(formData);
      navigate('/menu');
    }
  };

  const handleIrAlMenu = () => {
    navigate('/menu');
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

        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <form className="search-section" onSubmit={handleSearch}>
            <Search size={24} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Buscador rápido de herramientas (código o nombre)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            {isSearching && <span style={{ color: 'var(--text-secondary)' }}>...</span>}
          </form>

          {searchResults.length > 1 && (
            <div className="search-dropdown" style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: '#131520', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '16px',
              padding: '0.6rem', zIndex: 9999, maxHeight: '280px', overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                padding: '0.3rem 0.6rem 0.6rem 0.6rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '0.4rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Herramienta encontrada ({searchResults.length})</span>
                <span>Código</span>
              </div>
              {searchResults.map(tool => (
                <div 
                  key={tool.id} 
                  onClick={() => handleSelectTool(tool)}
                  style={{
                    padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '10px',
                    margin: '0.25rem 0',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.22)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔧</span>
                    <span style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.95rem' }}>{tool.descripcion}</span>
                  </div>
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.25)',
                    color: '#818cf8',
                    fontWeight: '700',
                    padding: '0.25rem 0.7rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(99, 102, 241, 0.35)'
                  }}>
                    #{tool.codigo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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

          <div className="actions-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isSessionActive ? (
              <button type="button" className="action-btn ingreso-btn" onClick={handleIngreso} style={{ width: '100%' }}>Ingresar</button>
            ) : (
              <button type="button" className="action-btn ingreso-btn" onClick={handleIrAlMenu} style={{ width: '100%' }}>Ir al Menú Principal</button>
            )}
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

      {/* Tool Card Modal */}
      <ToolCardModal 
        tool={selectedTool} 
        onClose={() => setSelectedTool(null)} 
      />
    </div>
  );
}

export default Home;
