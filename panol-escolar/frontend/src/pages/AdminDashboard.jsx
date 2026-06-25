import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [shiftResult, setShiftResult] = useState(null); // { success: bool, missing: [] }
  const [showShiftModal, setShowShiftModal] = useState(false);

  const handleCierreTurno = () => {
    // Read local database
    const retirosDb = JSON.parse(localStorage.getItem('panol_retiros') || '{}');
    const missing = [];
    
    // Check if any user has tools not returned
    Object.keys(retirosDb).forEach(userId => {
      const tools = retirosDb[userId];
      if (tools && tools.length > 0) {
        missing.push({
          usuario: userId.replace(/-/g, ' ').toUpperCase(),
          herramientas: tools
        });
      }
    });

    if (missing.length === 0) {
      setShiftResult({ success: true, missing: [] });
    } else {
      setShiftResult({ success: false, missing });
    }
    setShowShiftModal(true);
  };

  const closeShiftModal = () => {
    setShowShiftModal(false);
    setShiftResult(null);
  };

  const handlePlaceholder = (feature) => {
    alert(`La pantalla de ${feature} se encuentra en desarrollo.`);
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      
      <main className="main-card admin-dashboard">
        <header className="welcome-header">
          <h1>Panel de Administración</h1>
          <p>Control de herramientas e inventario</p>
        </header>
        
        <div className="admin-grid">
          <button className="admin-btn" onClick={() => navigate('/retiro')}>Retiro</button>
          <button className="admin-btn" onClick={() => navigate('/devolucion')}>Devolución</button>
          <button className="admin-btn" onClick={() => handlePlaceholder('Buscador')}>Buscador</button>
          <button className="admin-btn" onClick={() => handlePlaceholder('Carga de herramientas')}>Carga de herramientas</button>
          <button className="admin-btn" onClick={() => handlePlaceholder('Modificaciones')}>Modificaciones</button>
          <button className="admin-btn" onClick={() => handlePlaceholder('Inventario')}>Inventario</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', width: '100%' }}>
          <button 
            className="admin-btn shift-btn" 
            onClick={handleCierreTurno} 
            style={{ width: '100%', maxWidth: '350px' }}
          >
            Cierre de Turno
          </button>
        </div>

        <button className="back-btn" onClick={() => navigate('/')}>Volver al Inicio</button>

        {showShiftModal && shiftResult && (
          <div className="modal-overlay">
            <div className="modal-content shift-modal">
              <h2>Cierre de Turno</h2>
              {shiftResult.success ? (
                <div className="success-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <p>¡Excelente! Todas las herramientas fueron devueltas correctamente.</p>
                </div>
              ) : (
                <div className="error-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p>Faltan devolver las siguientes herramientas:</p>
                  <div className="missing-list">
                    {shiftResult.missing.map((item, i) => (
                      <div key={i} className="missing-item">
                        <strong>{item.usuario}</strong>
                        <ul>
                          {item.herramientas.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="login-btn" onClick={closeShiftModal}>Entendido</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
