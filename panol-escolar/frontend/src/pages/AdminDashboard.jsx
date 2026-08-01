import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRetiros, getSession } from '../utils/storage';
import '../App.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [shiftResult, setShiftResult] = useState(null); // { success: bool, missing: [] }
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleCierreTurno = async () => {
    const pending = await getRetiros();
    const missingMap = {};
    if (pending && pending.length > 0) {
      pending
        .slice()
        .sort((a, b) => String(a.herramienta?.codigo || '').localeCompare(String(b.herramienta?.codigo || ''), undefined, { numeric: true, sensitivity: 'base' }))
        .forEach(p => {
          const usuario = `${p.nombre_solicitante} ${p.apellido_solicitante} (${p.cargo_solicitante})`.toUpperCase();
          if (!missingMap[usuario]) missingMap[usuario] = [];
          const codigo = p.herramienta?.codigo || 'N/A';
          const desc = p.herramienta?.descripcion || 'Sin descripción';
          missingMap[usuario].push(`${codigo} - ${desc}`);
        });
    }

    const missing = Object.keys(missingMap).map(usuario => ({
      usuario,
      herramientas: missingMap[usuario]
    }));

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
          <button className="admin-btn" onClick={() => navigate('/admin/inventario')}>Buscador / Inventario</button>
          <button className="admin-btn" onClick={() => navigate('/admin/carga')}>Carga de herramientas</button>
          <button className="admin-btn" onClick={() => navigate('/admin/modificaciones')}>Modificaciones</button>
          {(session?.isSuperAdmin || session?.username === 'SalvucciPablo' || session?.cargo === 'ADMINISTRADOR PRINCIPAL' || session?.cargo === 'SUPER_ADMIN') && (
            <button
              className="admin-btn"
              onClick={() => navigate('/admin/usuarios')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: '800',
                border: '2px solid #fbbf24',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              👥 Administrar Usuarios Admin
            </button>
          )}
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
              <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                {!shiftResult.success && (
                  <button type="button" className="cancel-btn" onClick={closeShiftModal}>Cancelar</button>
                )}
                <button
                  type="button"
                  className="login-btn"
                  style={!shiftResult.success ? { backgroundColor: '#f59e0b', color: 'white' } : {}}
                  onClick={() => {
                    closeShiftModal();
                    navigate('/');
                  }}
                >
                  {shiftResult.success ? 'Finalizar Turno' : 'Forzar Cierre'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
