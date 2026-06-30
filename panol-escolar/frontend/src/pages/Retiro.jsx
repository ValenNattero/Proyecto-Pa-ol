import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import { getSession, saveRetiros } from '../utils/storage';
import '../App.css';

function Retiro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(location.state?.usuario || null);
  const [codigo, setCodigo] = useState('');
  const [herramientas, setHerramientas] = useState([]);

  useEffect(() => {
    if (!usuario) {
      const session = getSession();
      if (session) setUsuario(session);
      else navigate('/');
    }
  }, [usuario, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (codigo.trim() !== '') {
      const codeStr = codigo.trim();
      setCodigo(''); // Limpiar el input para mejor UX
      
      try {
        const response = await fetch(`http://localhost:8000/herramientas/buscar?q=${codeStr}`);
        if (response.ok) {
          const data = await response.json();
          const tool = data.find(t => t.codigo === codeStr);
          const desc = tool ? tool.descripcion : "Herramienta no encontrada";
          setHerramientas(prev => [...prev, { codigo: codeStr, descripcion: desc, checked: true }]);
        } else {
          setHerramientas(prev => [...prev, { codigo: codeStr, descripcion: "Error al buscar", checked: true }]);
        }
      } catch (err) {
        setHerramientas(prev => [...prev, { codigo: codeStr, descripcion: "Error de conexión", checked: true }]);
      }
    }
  };

  const handleToggle = (index) => {
    const nuevas = [...herramientas];
    nuevas[index].checked = !nuevas[index].checked;
    setHerramientas(nuevas);
  };

  const handleFinish = () => {
    const seleccionadas = herramientas.filter(h => h.checked).map(h => h.codigo);
    console.log("Herramientas a retirar:", seleccionadas, "por", usuario);
    saveRetiros(usuario, seleccionadas);
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <main className="main-card">
        <HamburgerMenu />
        
        <header className="welcome-header">
          <h1>Retiro de Herramientas</h1>
          {usuario && <p>Pañolero: {usuario.nombre} {usuario.apellido}</p>}
        </header>

        <form className="inline-action-form" onSubmit={handleAdd}>
          <input 
            type="text" 
            placeholder="Ingrese código de herramienta..." 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoFocus
          />
          <button type="submit" className="action-btn-small retiro-btn">+</button>
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

export default Retiro;
