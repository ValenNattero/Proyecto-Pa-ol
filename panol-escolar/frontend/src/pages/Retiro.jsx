import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import { getSession, saveRetiros } from '../utils/storage';
import '../App.css';

const CARGOS = [
  "ESTUDIANTE - PRIMERO PRIMERA",
  "ESTUDIANTE - PRIMERO SEGUNDA",
  "ESTUDIANTE - PRIMERO TERCERA",
  "ESTUDIANTE - PRIMERO CUARTA",
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

function Retiro() {
  const navigate = useNavigate();
  const [panolero, setPanolero] = useState(null);
  const [solicitante, setSolicitante] = useState({ nombre: '', apellido: '', cargo: '' });
  const [codigo, setCodigo] = useState('');
  const [herramientas, setHerramientas] = useState([]);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setPanolero(session);
    } else {
      setPanolero({ nombre: 'Administrador', apellido: 'Pañol', cargo: 'ADMINISTRADOR' });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSolicitante(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (codigo.trim() !== '') {
      const codeStr = codigo.trim().replace(/^#/, '');
      setCodigo(''); // Limpiar el input para mejor UX
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/herramientas/buscar?q=${encodeURIComponent(codeStr)}`);
        if (response.ok) {
          const data = await response.json();
          const tool = data.find(t => String(t.codigo) === codeStr || (/^\d+$/.test(codeStr) && String(t.codigo) === String(parseInt(codeStr, 10)))) || data[0];
          const desc = tool ? tool.descripcion : "Herramienta no encontrada";
          setHerramientas(prev => [...prev, { id: tool?.id, codigo: tool ? tool.codigo : codeStr, descripcion: desc, checked: true }]);
        } else {
          setHerramientas(prev => [...prev, { id: null, codigo: codeStr, descripcion: "Error al buscar", checked: true }]);
        }
      } catch {
        setHerramientas(prev => [...prev, { id: null, codigo: codeStr, descripcion: "Error de conexión", checked: true }]);
      }
    }
  };

  const handleToggle = (index) => {
    const nuevas = [...herramientas];
    nuevas[index].checked = !nuevas[index].checked;
    setHerramientas(nuevas);
  };

  const handleFinish = async (e) => {
    if (e) e.preventDefault();
    if (!solicitante.nombre || !solicitante.apellido || !solicitante.cargo) {
      alert('Por favor, complete los datos del solicitante.');
      return;
    }
    const seleccionadas = herramientas.filter(h => h.checked && h.id).map(h => h.id);
    if (seleccionadas.length === 0) {
      alert('No ha seleccionado ninguna herramienta válida para retirar.');
      return;
    }
    console.log("Herramientas a retirar:", seleccionadas, "por", solicitante);
    try {
      await saveRetiros(solicitante, seleccionadas);
      alert('Retiro registrado correctamente.');
      navigate(-1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <main className="main-card">
        <HamburgerMenu />
        
        <header className="welcome-header">
          <h1>Retiro de Herramientas</h1>
          {panolero && <p>Pañolero: {panolero.nombre} {panolero.apellido}</p>}
        </header>

        <form className="form-section" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px dashed var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Datos del Solicitante</h3>
          <div className="input-group">
            <input 
              type="text" 
              name="nombre" 
              placeholder="Nombre..." 
              value={solicitante.nombre}
              onChange={handleInputChange}
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="text" 
              name="apellido" 
              placeholder="Apellido..." 
              value={solicitante.apellido}
              onChange={handleInputChange}
              required 
            />
          </div>
          <div className="input-group">
            <select 
              name="cargo" 
              value={solicitante.cargo}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Seleccione un cargo...</option>
              {CARGOS.map((cargo, index) => (
                <option key={index} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
        </form>

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

        <div className="finish-section" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button type="button" className="action-btn-small finish-btn" onClick={handleFinish}>Fin</button>
          <button type="button" className="back-btn" onClick={() => navigate(-1)} style={{ margin: 0 }}>Volver</button>
        </div>
      </main>
    </div>
  );
}

export default Retiro;
