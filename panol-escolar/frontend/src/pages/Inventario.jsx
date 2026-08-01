import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import ToolCardModal from '../components/ToolCardModal';
import { Search, Filter, Download, ArrowLeft, Package, CheckCircle, Clock, ArrowUpDown } from 'lucide-react';
import '../App.css';

function Inventario() {
  const navigate = useNavigate();
  const [allHerramientas, setAllHerramientas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [disponibilidad, setDisponibilidad] = useState(''); // '' | 'disponible' | 'prestada'
  const [selectedTool, setSelectedTool] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [orden, setOrden] = useState('codigo'); // 'codigo' | 'descripcion'

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/herramientas/inventario');
      if (res.ok) {
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        setAllHerramientas(data);
      } else {
        setAllHerramientas([]);
      }
    } catch (err) {
      console.error("Error cargando inventario:", err);
      setAllHerramientas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleDownloadExcel = async () => {
    setDescargando(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/informes/inventario/excel');
      if (!res.ok) {
        throw new Error("No se pudo generar el archivo Excel");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventario_Panol_Escolar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando Excel:", err);
      alert("Ocurrió un error al intentar descargar el Excel del inventario.");
    } finally {
      setDescargando(false);
    }
  };

  const itemsAll = Array.isArray(allHerramientas) ? allHerramientas : [];
  const totalCount = itemsAll.length;
  const disponiblesCount = itemsAll.filter(h => h.disponible_en_panol === true).length;
  const prestadasCount = itemsAll.filter(h => h.disponible_en_panol === false).length;

  const listaHerramientas = itemsAll
    .filter(h => {
      if (q.trim()) {
        const term = q.toLowerCase().trim();
        const matchCodigo = h.codigo && h.codigo.toString().toLowerCase().includes(term);
        const matchDesc = h.descripcion && h.descripcion.toLowerCase().includes(term);
        const matchMarca = h.marca && h.marca.toLowerCase().includes(term);
        if (!matchCodigo && !matchDesc && !matchMarca) return false;
      }
      if (categoria && h.categoria !== categoria) {
        return false;
      }
      if (disponibilidad === 'disponible' && h.disponible_en_panol !== true) {
        return false;
      }
      if (disponibilidad === 'prestada' && h.disponible_en_panol !== false) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === 'codigo') {
        return String(a.codigo).localeCompare(String(b.codigo), undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return String(a.descripcion).localeCompare(String(b.descripcion), 'es', { sensitivity: 'base' });
      }
    });

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      padding: '2rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <main className="main-card" style={{
        maxWidth: '1250px',
        width: '98%',
        padding: '2.2rem',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 10px 35px rgba(0,0,0,0.6)'
      }}>
        <HamburgerMenu />

        {/* Header con botón de Excel */}
        <header className="welcome-header" style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          paddingBottom: '1.25rem',
          paddingRight: '60px'
        }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontSize: '2.2rem' }}>
              <Package size={32} color="#818cf8" /> Inventario
            </h1>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={descargando}
            style={{
              background: descargando ? 'rgba(16, 185, 129, 0.4)' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.8rem 1.4rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: descargando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={20} />
            {descargando ? 'Generando Excel...' : 'Descargar Inventario Excel (.XLSX)'}
          </button>
        </header>

        {/* Tarjetas de Indicadores Convertidas en Botones de Filtro Rápido */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <button
            type="button"
            onClick={() => setDisponibilidad('')}
            style={{
              background: disponibilidad === '' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255,255,255,0.04)',
              border: disponibilidad === '' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: disponibilidad === '' ? '0 0 18px rgba(99, 102, 241, 0.35)' : 'none'
            }}
          >
            <Package size={30} color="#818cf8" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Total En Pañol
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                {totalCount}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDisponibilidad('disponible')}
            style={{
              background: disponibilidad === 'disponible' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.08)',
              border: disponibilidad === 'disponible' ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '14px',
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: disponibilidad === 'disponible' ? '0 0 18px rgba(16, 185, 129, 0.35)' : 'none'
            }}
          >
            <CheckCircle size={30} color="#34d399" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Disponibles Hoy
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#34d399' }}>
                {disponiblesCount}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDisponibilidad('prestada')}
            style={{
              background: disponibilidad === 'prestada' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.08)',
              border: disponibilidad === 'prestada' ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '14px',
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: disponibilidad === 'prestada' ? '0 0 18px rgba(245, 158, 11, 0.35)' : 'none'
            }}
          >
            <Clock size={30} color="#fbbf24" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Prestadas En Taller
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fbbf24' }}>
                {prestadasCount}
              </div>
            </div>
          </button>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          background: 'rgba(255,255,255,0.03)',
          padding: '1rem',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.08)',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1 1 240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: '#64748b', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por código, descripción o marca..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.65rem 0.65rem 42px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{
              flex: '1 1 160px',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              background: '#1a1d2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            <option value="">Todas las Categorías</option>
            <option value="herramienta">Herramienta</option>
            <option value="insumo">Insumo</option>
            <option value="protección">Protección</option>
          </select>

          <select
            value={disponibilidad}
            onChange={(e) => setDisponibilidad(e.target.value)}
            style={{
              flex: '1 1 180px',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              background: '#1a1d2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            <option value="">Todas las Disponibilidades</option>
            <option value="disponible">Solo Disponibles en Pañol</option>
            <option value="prestada">Solo Prestadas en Taller</option>
          </select>

          <button
            type="submit"
            style={{
              padding: '0.65rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#3b82f6',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.95rem',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.45)',
              transition: 'all 0.2s ease'
            }}
          >
            <Filter size={18} /> Filtrar
          </button>

          <button
            type="button"
            onClick={() => {
              setQ('');
              setCategoria('');
              setDisponibilidad('');
            }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '0.65rem 1rem',
              cursor: 'pointer'
            }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => setOrden(prev => prev === 'codigo' ? 'descripcion' : 'codigo')}
            title="Cambiar criterio de ordenamiento"
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
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
        </form>

        {/* Lista de Herramientas del Inventario */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Cargando inventario...</p>
        ) : listaHerramientas.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              No se encontraron herramientas con los filtros especificados en el inventario actual.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1rem'
          }}>
            {listaHerramientas.map((h) => {
              const enPanol = h.disponible_en_panol;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedTool(h)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: enPanol ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.8rem',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontWeight: '800',
                        fontSize: '0.8rem'
                      }}>
                        #{h.codigo || h.id}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: h.estado === 'En servicio' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: h.estado === 'En servicio' ? '#34d399' : '#f87171',
                        fontWeight: '700'
                      }}>
                        {h.estado}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.35rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>
                      {h.descripcion}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Categoría: <span style={{ color: '#cbd5e1' }}>{h.categoria}</span> | Marca: <span style={{ color: '#cbd5e1' }}>{h.marca}</span>
                    </div>
                  </div>

                  {/* Estado de disponibilidad en tiempo real */}
                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {enPanol ? (
                      <span style={{
                        color: '#34d399',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        ✓ DISPONIBLE EN PAÑOL
                      </span>
                    ) : (
                      <span style={{
                        color: '#fbbf24',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        lineHeight: '1.2'
                      }}>
                        ⏳ PRESTADA: {h.prestado_a} ({h.cargo_solicitante})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <button
            className="action-btn-secondary"
            onClick={() => navigate('/admin')}
            style={{
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Volver al Panel de Administración
          </button>
        </div>
      </main>

      {/* Modal de Detalle */}
      {selectedTool && (
        <ToolCardModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}

export default Inventario;
