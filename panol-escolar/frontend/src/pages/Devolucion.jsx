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
      Promise.all(pending.map(async (cod) => {
        try {
          const res = await fetch(`http://localhost:8000/herramientas/buscar?q=${cod}`);
          if (res.ok) {
            const data = await res.json();
            const tool = data.find(t => t.codigo === cod);
            return { codigo: cod, observaciones: '', checked: true, descripcion: tool ? tool.descripcion : "Herramienta no encontrada" };
          }
          return { codigo: cod, observaciones: '', checked: true, descripcion: "Error al buscar" };
        } catch (e) {
          return { codigo: cod, observaciones: '', checked: true, descripcion: "Error de conexión" };
        }
      })).then(results => {
        setHerramientas(results);
      });
    }
  }, [usuario, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (codigo.trim() !== '') {
      const codeStr = codigo.trim();
      const obsStr = observaciones;
      setCodigo('');
      setObservaciones('');
      
      try {
        const response = await fetch(`http://localhost:8000/herramientas/buscar?q=${codeStr}`);
        if (response.ok) {
          const data = await response.json();
          const tool = data.find(t => t.codigo === codeStr);
          const desc = tool ? tool.descripcion : "Herramienta no encontrada";
          setHerramientas(prev => [...prev, { codigo: codeStr, observaciones: obsStr, descripcion: desc, checked: true }]);
        } else {
          setHerramientas(prev => [...prev, { codigo: codeStr, observaciones: obsStr, descripcion: "Error al buscar", checked: true }]);
        }
      } catch (err) {
        setHerramientas(prev => [...prev, { codigo: codeStr, observaciones: obsStr, descripcion: "Error de conexión", checked: true }]);
      }
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
                    <span className="item-code">{h.codigo} - {h.descripcion}</span>
                    {h.observaciones && <span className="item-obs"> - Obs: {h.observaciones}</span>}
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
