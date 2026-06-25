import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import { getSession, getRetiros, clearRetiros } from '../utils/storage';
import '../App.css';

function Devolucion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(location.state?.usuario || null);
  const [codigo, setCodigo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [herramientas, setHerramientas] = useState([]);

  useEffect(() => {
    let currentUser = usuario;
    if (!currentUser) {
      const session = getSession();
      if (session) {
        setUsuario(session);
        currentUser = session;
      } else {
        navigate('/');
        return;
      }
    }
    
    const pending = getRetiros(currentUser);
    if (pending && pending.length > 0) {
      setHerramientas(pending.map(cod => ({ codigo: cod, observaciones: '', checked: true })));
    }
  }, [usuario, navigate]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (codigo.trim() !== '') {
      setHerramientas([...herramientas, { codigo: codigo.trim(), observaciones, checked: true }]);
      setCodigo('');
      setObservaciones('');
    }
  };

  const handleToggle = (index) => {
    const nuevas = [...herramientas];
    nuevas[index].checked = !nuevas[index].checked;
    setHerramientas(nuevas);
  };

  const handleFinish = () => {
    const seleccionadas = herramientas.filter(h => h.checked);
    console.log("Herramientas devueltas:", seleccionadas, "por", usuario);
    clearRetiros(usuario, seleccionadas);
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <main className="main-card">
        <HamburgerMenu />

        <header className="welcome-header">
          <h1>Devolución de Herramientas</h1>
          {usuario && <p>Pañolero: {usuario.nombre} {usuario.apellido}</p>}
        </header>

        <form className="inline-action-form" onSubmit={handleAdd}>
          <input 
            type="text" 
            placeholder="Código..." 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoFocus
          />
          <input 
            type="text" 
            placeholder="Observaciones (opcional)..." 
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="obs-input"
          />
          <button type="submit" className="action-btn-small devolucion-btn">+</button>
        </form>

        <div className="items-list">
          {herramientas.length === 0 ? (
            <p className="empty-text">No hay herramientas en la lista.</p>
          ) : (
            <ul>
              {herramientas.map((h, i) => (
                <li key={i} className={!h.checked ? "unchecked-item" : ""}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={h.checked} 
                      onChange={() => handleToggle(i)} 
                    />
                    <span className="item-code">{h.codigo}</span>
                    {h.observaciones && <span className="item-obs"> - {h.observaciones}</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="finish-section">
          <button type="button" className="action-btn-small finish-btn" onClick={handleFinish}>Fin</button>
        </div>
      </main>
    </div>
  );
}

export default Devolucion;
