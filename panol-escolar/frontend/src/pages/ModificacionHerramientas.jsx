import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import {
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Save,
  Package
} from 'lucide-react';
import './ModificacionHerramientas.css';
import '../App.css';

function ModificacionHerramientas() {
  const navigate = useNavigate();
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState(''); // '' | 'herramienta' | 'insumo' | 'material de proteccion'
  const [filterEstado, setFilterEstado] = useState(''); // '' | 'En servicio' | 'Reparacion' | 'Rota'

  // Edit Modal State
  const [editingTool, setEditingTool] = useState(null); // Tool object being edited
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingTool, setDeletingTool] = useState(null); // Tool object to delete
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/herramientas/inventario');
      if (res.ok) {
        const data = await res.json();
        setHerramientas(Array.isArray(data) ? data : []);
      } else {
        setHerramientas([]);
      }
    } catch (err) {
      console.error('Error cargando inventario para modificación:', err);
      setHerramientas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  // Quick State Change directly from Table row
  const handleQuickStatusChange = async (toolId, newEstado) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/herramientas/${toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newEstado })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'No se pudo actualizar el estado');
      }

      // Update local state without full reload
      setHerramientas((prev) =>
        prev.map((h) => (h.id === toolId ? { ...h, estado: newEstado } : h))
      );
      showToast('Estado de la herramienta actualizado correctamente.');
    } catch (err) {
      alert('Error al actualizar el estado: ' + err.message);
    }
  };

  // Full Edit Submission
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTool) return;
    if (!editingTool.descripcion?.trim()) {
      alert('La descripción no puede estar vacía.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/herramientas/${editingTool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: editingTool.codigo?.trim() || null,
          descripcion: editingTool.descripcion.trim(),
          categoria: editingTool.categoria,
          marca: editingTool.marca?.trim() || null,
          origen: editingTool.origen,
          estado: editingTool.estado
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al modificar herramienta.');
      }

      const updated = await res.json();
      setHerramientas((prev) =>
        prev.map((h) =>
          h.id === editingTool.id
            ? {
                ...h,
                codigo: updated.codigo || h.codigo,
                descripcion: updated.descripcion,
                categoria: updated.categoria,
                marca: updated.marca || '-',
                origen: updated.origen,
                estado: updated.estado
              }
            : h
        )
      );

      setEditingTool(null);
      showToast('Herramienta modificada con éxito.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Submission
  const handleConfirmDelete = async () => {
    if (!deletingTool) return;

    setConfirmingDelete(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/herramientas/${deletingTool.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al eliminar herramienta.');
      }

      setHerramientas((prev) => prev.filter((h) => h.id !== deletingTool.id));
      setDeletingTool(null);
      showToast('Herramienta eliminada del inventario.');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setConfirmingDelete(false);
    }
  };

  // Filter tools
  const filteredTools = herramientas.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCod = h.codigo && h.codigo.toString().toLowerCase().includes(q);
      const matchDesc = h.descripcion && h.descripcion.toLowerCase().includes(q);
      const matchMarca = h.marca && h.marca.toLowerCase().includes(q);
      if (!matchCod && !matchDesc && !matchMarca) return false;
    }
    if (filterCategoria && h.categoria !== filterCategoria) {
      return false;
    }
    if (filterEstado && h.estado !== filterEstado) {
      return false;
    }
    return true;
  });

  const getStatusClass = (estado) => {
    if (estado === 'En servicio') return 'en-servicio';
    if (estado === 'Reparacion') return 'reparacion';
    if (estado === 'Rota') return 'rota';
    return '';
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', width: '100%', padding: '2rem 1rem' }}>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <HamburgerMenu />

      <main className="mod-container">
        <header className="mod-header">
          <h1>Modificación de Herramientas</h1>
          <p>
            Edita los atributos y el estado de las herramientas del inventario, o dadas de baja por rotura o reemplazo.
          </p>
        </header>

        {/* Filters and Search Bar */}
        <div className="mod-filters-card">
          <div className="filters-top-row">
            <div className="mod-search-box">
              <Search size={20} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar por código, descripción o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="filter-selects-group">
              <select
                className="mod-select"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                <option value="herramienta">Herramienta</option>
                <option value="insumo">Insumo</option>
                <option value="material de proteccion">Material Protección</option>
              </select>

              <button
                type="button"
                className="clear-btn"
                style={{ padding: '0.6rem 1rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategoria('');
                  setFilterEstado('');
                }}
              >
                <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Quick status filter pills */}
          <div className="status-filter-pills">
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginRight: '0.5rem' }}>
              Estado:
            </span>
            <button
              type="button"
              className={`status-pill-btn ${filterEstado === '' ? 'active' : ''}`}
              onClick={() => setFilterEstado('')}
            >
              Todos ({herramientas.length})
            </button>
            <button
              type="button"
              className={`status-pill-btn ${filterEstado === 'En servicio' ? 'active' : ''}`}
              onClick={() => setFilterEstado('En servicio')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
              En servicio ({herramientas.filter((h) => h.estado === 'En servicio').length})
            </button>
            <button
              type="button"
              className={`status-pill-btn ${filterEstado === 'Reparacion' ? 'active' : ''}`}
              onClick={() => setFilterEstado('Reparacion')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
              Reparación ({herramientas.filter((h) => h.estado === 'Reparacion').length})
            </button>
            <button
              type="button"
              className={`status-pill-btn ${filterEstado === 'Rota' ? 'active' : ''}`}
              onClick={() => setFilterEstado('Rota')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
              Rota ({herramientas.filter((h) => h.estado === 'Rota').length})
            </button>

            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.85rem' }}>
              Mostrando {filteredTools.length} {filteredTools.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>
        </div>

        {/* Tools List Card */}
        <div className="mod-content-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <RefreshCw className="spin-icon" size={32} />
              <p style={{ marginTop: '1rem' }}>Cargando herramientas del inventario...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Package size={42} style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <p>No se encontraron herramientas con los criterios de búsqueda o filtros seleccionados.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="mod-table">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Código</th>
                    <th style={{ width: '28%' }}>Descripción</th>
                    <th style={{ width: '15%' }}>Categoría</th>
                    <th style={{ width: '13%' }}>Marca</th>
                    <th style={{ width: '10%' }}>Origen</th>
                    <th style={{ width: '12%' }}>Estado Rápido</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.id}>
                      <td>
                        <strong style={{ color: '#f8fafc' }}>{tool.codigo || `#${tool.id}`}</strong>
                      </td>
                      <td>
                        <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{tool.descripcion}</div>
                        {!tool.disponible_en_panol && (
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                            • Prestada ({tool.prestado_a})
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="category-pill">{tool.categoria}</span>
                      </td>
                      <td style={{ color: '#cbd5e1' }}>{tool.marca || '-'}</td>
                      <td style={{ color: '#cbd5e1' }}>{tool.origen || 'PMI'}</td>
                      <td>
                        <select
                          className={`status-quick-select ${getStatusClass(tool.estado)}`}
                          value={tool.estado}
                          onChange={(e) => handleQuickStatusChange(tool.id, e.target.value)}
                          title="Cambia el estado de forma inmediata"
                        >
                          <option value="En servicio">En servicio</option>
                          <option value="Reparacion">Reparación</option>
                          <option value="Rota">Rota</option>
                        </select>
                      </td>
                      <td>
                        <div className="mod-table-actions">
                          <button
                            type="button"
                            className="edit-action-btn"
                            title="Editar todos los datos"
                            onClick={() => setEditingTool({ ...tool })}
                          >
                            <Edit3 size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="delete-action-btn"
                            title="Eliminar herramienta"
                            onClick={() => setDeletingTool(tool)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            Volver al Panel de Administración
          </button>
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingTool && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal-card">
            <div className="edit-modal-header">
              <h2>Modificar Herramienta #{editingTool.id}</h2>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setEditingTool(null)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-row-2">
                <div className="form-group-mod">
                  <label>Código</label>
                  <input
                    type="text"
                    className="form-input-mod"
                    placeholder="Ej: HER-001"
                    value={editingTool.codigo || ''}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, codigo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-mod">
                  <label>Categoría</label>
                  <select
                    className="form-select-mod"
                    value={editingTool.categoria}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, categoria: e.target.value })
                    }
                  >
                    <option value="herramienta">Herramienta</option>
                    <option value="insumo">Insumo</option>
                    <option value="material de proteccion">Material Protección</option>
                  </select>
                </div>
              </div>

              <div className="form-group-mod">
                <label>Descripción *</label>
                <input
                  type="text"
                  className="form-input-mod"
                  required
                  placeholder="Descripción detallada de la herramienta"
                  value={editingTool.descripcion || ''}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-mod">
                  <label>Marca</label>
                  <input
                    type="text"
                    className="form-input-mod"
                    placeholder="Ej: Bosch / Stanley"
                    value={editingTool.marca || ''}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, marca: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-mod">
                  <label>Origen</label>
                  <select
                    className="form-select-mod"
                    value={editingTool.origen || 'PMI'}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, origen: e.target.value })
                    }
                  >
                    <option value="PMI">PMI</option>
                    <option value="Cooperadora">Cooperadora</option>
                    <option value="Escuela">Escuela</option>
                    <option value="Donación">Donación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="form-group-mod">
                <label>Estado de la Herramienta</label>
                <select
                  className="form-select-mod"
                  value={editingTool.estado}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, estado: e.target.value })
                  }
                >
                  <option value="En servicio">En servicio</option>
                  <option value="Reparacion">Reparación</option>
                  <option value="Rota">Rota</option>
                </select>
              </div>

              <div className="modal-footer-mod">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingTool(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="login-btn" disabled={savingEdit}>
                  <Save size={18} />
                  {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTool && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="warning-icon-wrapper">
              <AlertTriangle size={42} />
            </div>
            <h2>¿Eliminar Herramienta?</h2>
            <p>
              Estás a punto de eliminar <strong>"{deletingTool.descripcion}"</strong> ({deletingTool.codigo || `#${deletingTool.id}`}) del inventario. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeletingTool(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={confirmingDelete}
              >
                {confirmingDelete ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={22} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ModificacionHerramientas;
