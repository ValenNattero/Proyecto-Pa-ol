import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import { getSession, getRetiros, clearRetiros } from '../utils/storage';
import { ArrowUpDown } from 'lucide-react';
import '../App.css';

function Devolucion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [panolero, setPanolero] = useState(null);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [herramientas, setHerramientas] = useState([]);
  const [showFaltantesModal, setShowFaltantesModal] = useState(false);
  const [orden, setOrden] = useState('codigo'); // 'codigo' | 'descripcion'

  const loadRetiros = async () => {
    const pending = await getRetiros();
    if (pending && pending.length > 0) {
      const mapped = pending.map(p => ({
        id: p.id,
        codigo: p.herramienta?.codigo || 'N/A',
        descripcion: p.herramienta?.descripcion || 'Herramienta sin descripción',
        observaciones: p.observacion || '',
        prestadoA: `${p.nombre_solicitante} ${p.apellido_solicitante}`,
        checked: false
      }));
      setHerramientas(mapped);
    } else {
      setHerramientas([]);
    }
  };

  useEffect(() => {
    const session = getSession();
    if (session) {
      setPanolero(session);
    } else {
      setPanolero({ nombre: 'Administrador', apellido: 'Pañol', cargo: 'ADMINISTRADOR' });
    }
    loadRetiros();
  }, []);

  const handleToggle = (id) => {
    setHerramientas(prev => prev.map(h => h.id === id ? { ...h, checked: !h.checked } : h));
  };

  const handleFinish = async () => {
    const seleccionadas = herramientas.filter(h => h.checked && h.id).map(h => h.id);
    if (seleccionadas.length === 0) {
      alert('No ha seleccionado ninguna herramienta para devolver.');
      return;
    }
    try {
      await clearRetiros(seleccionadas);
      alert('Devolución registrada correctamente.');
      navigate(-1);
    } catch(err) {
      alert(err.message);
    }
  };

  const herramientasFiltradas = herramientas
    .filter(h => {
      const matchCodigo = h.codigo.toLowerCase().includes(filtroCodigo.toLowerCase());
      const matchDesc = h.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase());
      return matchCodigo && matchDesc;
    })
    .sort((a, b) => {
      if (orden === 'codigo') {
        return String(a.codigo).localeCompare(String(b.codigo), undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return String(a.descripcion).localeCompare(String(b.descripcion), 'es', { sensitivity: 'base' });
      }
    });

  const faltantesAgrupados = herramientas
    .slice()
    .sort((a, b) => {
      if (orden === 'codigo') {
        return String(a.codigo).localeCompare(String(b.codigo), undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return String(a.descripcion).localeCompare(String(b.descripcion), 'es', { sensitivity: 'base' });
      }
    })
    .reduce((acc, h) => {
      if (!acc[h.prestadoA]) acc[h.prestadoA] = [];
      acc[h.prestadoA].push(`${h.codigo} - ${h.descripcion}`);
      return acc;
    }, {});

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <main className="main-card">
        <HamburgerMenu />

        <header className="welcome-header">
          <h1>Devolución de Herramientas</h1>
          {panolero && <p>Pañolero: {panolero.nombre} {panolero.apellido}</p>}
        </header>

        <div className="filters-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            value={filtroCodigo}
            onChange={e => setFiltroCodigo(e.target.value)}
            style={{ flex: '1 1 180px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
          />
          <input 
            type="text" 
            placeholder="Filtrar por descripción..." 
            value={filtroDescripcion}
            onChange={e => setFiltroDescripcion(e.target.value)}
            style={{ flex: '1 1 180px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={() => setOrden(prev => prev === 'codigo' ? 'descripcion' : 'codigo')}
            title="Cambiar criterio de ordenamiento"
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowUpDown size={16} />
            {orden === 'codigo' ? 'Por código ↓↑' : 'Por descripción ↓↑'}
          </button>
        </div>

        <div className="items-list">
          {herramientasFiltradas.length === 0 ? (
            <p className="empty-text">No hay herramientas para devolver con esos filtros.</p>
          ) : (
            <ul>
              {herramientasFiltradas.map((h) => (
                <li key={h.id} className={!h.checked ? "unchecked-item" : ""}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={h.checked} 
                      onChange={() => handleToggle(h.id)} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="item-code">{h.codigo} - {h.descripcion}</span>
                      <span className="item-obs" style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Prestado a: {h.prestadoA}</span>
                      {h.observaciones && <span className="item-obs">Obs: {h.observaciones}</span>}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="finish-section" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="button" className="action-btn" onClick={() => setShowFaltantesModal(true)} style={{ flex: 1, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
            Ver Faltantes
          </button>
          <button type="button" className="action-btn finish-btn" onClick={handleFinish} style={{ flex: 2, backgroundColor: 'var(--accent-color)' }}>
            Confirmar Devolución
          </button>
          <button type="button" className="back-btn" onClick={() => navigate(-1)} style={{ margin: 0 }}>
            Volver
          </button>
        </div>

        {showFaltantesModal && (
          <div className="modal-overlay">
            <div className="modal-content shift-modal">
              <h2>Herramientas Faltantes</h2>
              {herramientas.length === 0 ? (
                <div className="success-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <p>¡Excelente! No hay herramientas prestadas actualmente.</p>
                </div>
              ) : (
                <div className="error-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p>Faltan devolver las siguientes herramientas:</p>
                  <div className="missing-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Object.keys(faltantesAgrupados).map((usuario, i) => (
                      <div key={i} className="missing-item">
                        <strong>{usuario}</strong>
                        <ul>
                          {faltantesAgrupados[usuario].map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowFaltantesModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Devolucion;
