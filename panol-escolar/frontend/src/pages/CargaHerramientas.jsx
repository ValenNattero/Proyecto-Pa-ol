import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import {
  PlusCircle,
  Layers,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  X,
  FileText,
  QrCode,
  Printer,
  Sparkles,
  Eye,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import './CargaHerramientas.css';
import '../App.css';

function CargaHerramientas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'excel' | 'qr'
  const fileInputRef = useRef(null);

  // Manual Multi-row State - Sin input de código, se muestra el próximo código numérico real de la BD
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      descripcion: '',
      categoria: 'herramienta',
      marca: '',
      origen: 'PMI',
      estado: 'En servicio',
      error: false
    }
  ]);
  const [savingManual, setSavingManual] = useState(false);
  const [proximosCodigos, setProximosCodigos] = useState([]);

  // QR Optional Generator State
  const [enableQR, setEnableQR] = useState(false);
  const [qrList, setQrList] = useState([
    { id: 'sample-1', code: 'PANOL-QR-412', label: '412 - Taladro percutor Bosch' },
    { id: 'sample-2', code: 'PANOL-QR-411', label: '411 - Disco de corte 115mm' }
  ]);
  const [customQrCode, setCustomQrCode] = useState('');
  const [customQrLabel, setCustomQrLabel] = useState('');
  const [previewQR, setPreviewQR] = useState(null); // { code, label }

  // Excel State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Modal / Toast Notification State
  const [modalSuccess, setModalSuccess] = useState(null); // { count: number, message: string, items: Array }
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch next available sequential DB codes
  const fetchProximosCodigos = useCallback(async () => {
    try {
      const count = Math.max(15, rows.length + 5);
      const res = await fetch(`http://127.0.0.1:8000/herramientas/proximo-codigo?count=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data.siguientes) {
          setProximosCodigos(data.siguientes);
        }
      }
    } catch (_e) {
      // Si hay error de red temporal, mantener el estado anterior
    }
  }, [rows.length]);

  useEffect(() => {
    fetchProximosCodigos();
  }, [fetchProximosCodigos]);

  // --- Manual Mode Handlers ---
  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: value,
      error: field === 'descripcion' && !value.trim() ? true : updated[index].error
    };
    setRows(updated);
  };

  const handleAddRow = (count = 1) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      descripcion: '',
      categoria: 'herramienta',
      marca: '',
      origen: 'PMI',
      estado: 'En servicio',
      error: false
    }));
    setRows([...rows, ...newRows]);
  };

  const handleDuplicateRow = (index) => {
    const rowToCopy = rows[index];
    const newRow = {
      ...rowToCopy,
      id: Date.now()
    };
    const updated = [...rows];
    updated.splice(index + 1, 0, newRow);
    setRows(updated);
  };

  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      setRows([
        {
          id: Date.now(),
          descripcion: '',
          categoria: 'herramienta',
          marca: '',
          origen: 'PMI',
          estado: 'En servicio',
          error: false
        }
      ]);
      return;
    }
    const updated = rows.filter((_, idx) => idx !== index);
    setRows(updated);
  };

  const handleClearRows = () => {
    setRows([
      {
        id: Date.now(),
        descripcion: '',
        categoria: 'herramienta',
        marca: '',
        origen: 'PMI',
        estado: 'En servicio',
        error: false
      }
    ]);
    setErrorMessage('');
  };

  const handleSubmitManual = async () => {
    setErrorMessage('');
    const validRows = [];
    let hasError = false;

    const checkedRows = rows.map((r) => {
      if (!r.descripcion.trim()) {
        hasError = true;
        return { ...r, error: true };
      }

      validRows.push({
        codigo: null,
        descripcion: r.descripcion.trim(),
        categoria: r.categoria,
        marca: r.marca.trim() || null,
        origen: r.origen,
        estado: r.estado,
        codigo_qr: null
      });
      return { ...r, error: false };
    });

    if (hasError) {
      setRows(checkedRows);
      setErrorMessage('Por favor, completa la descripción en todas las filas marcadas en rojo.');
      return;
    }

    setSavingManual(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/herramientas/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRows)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al guardar herramientas en el inventario.');
      }

      const created = await res.json();

      // Automatically push created tools to QR generator list if enableQR was active
      if (enableQR && created) {
        const newQrs = created.map((h) => ({
          id: `qr-${h.id}`,
          code: h.codigo_qr || `PANOL-QR-${h.codigo}`,
          label: `${h.codigo} - ${h.descripcion}`
        }));
        setQrList((prev) => [...newQrs, ...prev]);
      }

      setModalSuccess({
        count: created.length,
        message: `Se guardaron ${created.length} herramientas en la Base de Datos con sus códigos numéricos correlativos sin repetir:`,
        items: created
      });
      handleClearRows();
      fetchProximosCodigos();
    } catch (err) {
      setErrorMessage(err.message || 'Ocurrió un error de conexión con el servidor.');
    } finally {
      setSavingManual(false);
    }
  };

  // --- QR Generator Handlers ---
  const handleAddCustomQR = (e) => {
    e.preventDefault();
    if (!customQrCode.trim() || !customQrLabel.trim()) {
      setErrorMessage('Por favor, ingresa el código y la etiqueta para crear el QR.');
      return;
    }
    setErrorMessage('');
    const newQr = {
      id: `custom-${Date.now()}`,
      code: customQrCode.trim(),
      label: customQrLabel.trim()
    };
    setQrList((prev) => [newQr, ...prev]);
    setCustomQrCode('');
    setCustomQrLabel('');
  };

  const handleDownloadPNG = (id, filename) => {
    const canvas = document.getElementById(`qr-canvas-${id}`);
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `Etiqueta_QR_${filename.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No se pudo generar la imagen PNG del código QR.');
    }
  };

  const handlePrintLabels = () => {
    window.print();
  };

  // --- Excel Mode Handlers ---
  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/herramientas/plantilla-excel');
      if (!res.ok) throw new Error('No se pudo descargar la plantilla.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_carga_herramientas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar la plantilla: ' + err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Formato inválido. Por favor, sube un archivo Excel (.xlsx o .xls).');
      }
    }
  };

  const handleUploadExcel = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor selecciona un archivo Excel primero.');
      return;
    }

    setUploadingExcel(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('http://127.0.0.1:8000/herramientas/importar-excel', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al procesar el archivo Excel.');
      }

      const data = await res.json();
      setModalSuccess({
        count: data.importadas,
        message: data.mensaje || `Se cargaron ${data.importadas} herramientas en la base de datos con sus códigos autogenerados:`,
        items: data.items || []
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProximosCodigos();
    } catch (err) {
      setErrorMessage(err.message || 'Error importando el archivo Excel.');
    } finally {
      setUploadingExcel(false);
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', width: '100%', padding: '2rem 1rem' }}>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <HamburgerMenu />

      <main className="carga-container">
        <header className="carga-header">
          <h1>Carga de Herramientas</h1>
          <p>
            Agrega nuevas herramientas al inventario. Los códigos se autogeneran de forma consecutiva en la base de datos sin repetirse jamás.
          </p>
        </header>

        {/* Mode Selector Tabs */}
        <div className="carga-tabs">
          <button
            type="button"
            className={`carga-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('manual');
              setErrorMessage('');
            }}
          >
            <Layers size={18} />
            Carga Múltiple (Manual)
          </button>
          <button
            type="button"
            className={`carga-tab-btn ${activeTab === 'excel' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('excel');
              setErrorMessage('');
            }}
          >
            <FileSpreadsheet size={18} />
            Subir Archivo Excel
          </button>
          <button
            type="button"
            className={`carga-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('qr');
              setErrorMessage('');
            }}
          >
            <QrCode size={18} />
            Generador de QR (Opcional)
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertCircle size={22} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="carga-content-card">
          {/* TAB 1: MANUAL MULTI-ROW LOAD */}
          {activeTab === 'manual' && (
            <div>
              {/* Optional QR Toggle Banner */}
              <div className="qr-toggle-banner">
                <label className="qr-toggle-label">
                  <input
                    type="checkbox"
                    checked={enableQR}
                    onChange={(e) => setEnableQR(e.target.checked)}
                  />
                  ⚡ Asignar Códigos QR automáticamente al guardar (Opcional para futuro)
                </label>
                {enableQR && (
                  <span style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={16} />
                    Se vincularán al generador de etiquetas
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={22} color="#6366f1" />
                    Listado de Nuevas Herramientas
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                    La base de datos genera automáticamente los códigos consecutivos a partir de <strong>{proximosCodigos[0] || '...'}</strong> sin repetir los existentes.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="row-action-btn"
                    title="Actualizar próximos códigos desde BD"
                    onClick={fetchProximosCodigos}
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <RefreshCw size={16} />
                  </button>
                  <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {rows.length} {rows.length === 1 ? 'ítem a cargar' : 'ítems a cargar'}
                  </span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="carga-table">
                  <thead>
                    <tr>
                      <th style={{ width: '13%', textAlign: 'center' }} title="Código correlativo real autogenerado por la Base de Datos">Código BD (Auto)</th>
                      <th style={{ width: '31%' }}>Descripción *</th>
                      <th style={{ width: '16%' }}>Categoría</th>
                      <th style={{ width: '15%' }}>Marca</th>
                      <th style={{ width: '12%' }}>Origen</th>
                      <th style={{ width: '13%' }}>Estado</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ textAlign: 'center' }}>
                          <span className="code-badge-green" title="Próximo código numérico disponible en la base de datos">
                            {proximosCodigos[index] || '...'}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            className={`table-input ${row.error ? 'input-error' : ''}`}
                            placeholder="Ej: Taladro de banco 500W..."
                            value={row.descripcion}
                            onChange={(e) => handleRowChange(index, 'descripcion', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={row.categoria}
                            onChange={(e) => handleRowChange(index, 'categoria', e.target.value)}
                          >
                            <option value="herramienta">Herramienta</option>
                            <option value="insumo">Insumo</option>
                            <option value="material de proteccion">Material Protección</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            placeholder="Ej: Bosch / -"
                            value={row.marca}
                            onChange={(e) => handleRowChange(index, 'marca', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={row.origen}
                            onChange={(e) => handleRowChange(index, 'origen', e.target.value)}
                          >
                            <option value="PMI">PMI</option>
                            <option value="Cooperadora">Cooperadora</option>
                            <option value="Escuela">Escuela</option>
                            <option value="Donación">Donación</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={row.estado}
                            onChange={(e) => handleRowChange(index, 'estado', e.target.value)}
                          >
                            <option value="En servicio">En servicio</option>
                            <option value="Reparacion">Reparación</option>
                            <option value="Rota">Rota</option>
                          </select>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="row-action-btn"
                              title="Duplicar fila"
                              onClick={() => handleDuplicateRow(index)}
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              type="button"
                              className="row-action-btn delete"
                              title="Eliminar fila"
                              onClick={() => handleDeleteRow(index)}
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

              <div className="carga-actions-bar">
                <div className="add-rows-group">
                  <button type="button" className="add-row-btn" onClick={() => handleAddRow(1)}>
                    <Plus size={18} />
                    Agregar otra herramienta
                  </button>
                  <button type="button" className="add-row-btn" onClick={() => handleAddRow(5)}>
                    <Plus size={18} />
                    +5 filas
                  </button>
                  <button type="button" className="clear-btn" onClick={handleClearRows}>
                    Limpiar lista
                  </button>
                </div>

                <button
                  type="button"
                  className="submit-bulk-btn"
                  onClick={handleSubmitManual}
                  disabled={savingManual}
                >
                  <Save size={20} />
                  {savingManual ? 'Guardando en BD...' : 'Guardar Herramientas en Base de Datos'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXCEL IMPORT */}
          {activeTab === 'excel' && (
            <div className="excel-section">
              <div className="excel-info-card">
                <h3>
                  <FileSpreadsheet size={24} color="#10b981" />
                  Carga por Planilla de Excel
                </h3>
                <p>
                  Sube un archivo <strong>.xlsx</strong> o <strong>.xls</strong> con la lista de herramientas. El archivo debe contener una columna llamada <strong>descripcion</strong> (requerida). <strong>La base de datos auto-genera el código numérico incremental correlativo para cada ítem</strong> automáticamente si dejas la columna <strong>codigo</strong> vacía, continuando desde <strong>{proximosCodigos[0] || '413'}</strong>.
                </p>
                <div>
                  <button type="button" className="template-download-btn" onClick={handleDownloadTemplate}>
                    <Download size={18} />
                    Descargar Plantilla de Excel de Ejemplo
                  </button>
                </div>
              </div>

              <div
                className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <Upload size={32} />
                  </div>
                  <h4>Arrastra y suelta tu planilla aquí o haz clic para buscar</h4>
                  <p>Admite archivos .xlsx y .xls generados desde Excel o LibreOffice</p>
                </div>
              </div>

              {selectedFile && (
                <div className="file-selected-box">
                  <div className="file-info">
                    <FileText size={28} color="#10b981" />
                    <div className="file-info-text">
                      <h5>{selectedFile.name}</h5>
                      <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    title="Quitar archivo"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="submit-bulk-btn"
                  onClick={handleUploadExcel}
                  disabled={!selectedFile || uploadingExcel}
                >
                  <Save size={20} />
                  {uploadingExcel ? 'Procesando archivo...' : 'Procesar y Guardar Archivo Excel'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QR GENERATOR & PRINT LABELS (OPTIONAL / FUTURE) */}
          {activeTab === 'qr' && (
            <div className="qr-section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={24} color="#6366f1" />
                    Generador e Impresión de Códigos QR (Opcional)
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', fontSize: '0.95rem' }}>
                    Previsualiza, descarga en PNG o imprime hojas de etiquetas para identificar físicamente las herramientas.
                  </p>
                </div>

                <button
                  type="button"
                  className="submit-bulk-btn"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}
                  onClick={handlePrintLabels}
                >
                  <Printer size={20} />
                  Imprimir Hoja de Etiquetas QR
                </button>
              </div>

              {/* Custom QR Add Card */}
              <form className="qr-custom-input-card" onSubmit={handleAddCustomQR}>
                <input
                  type="text"
                  placeholder="Código QR (ej: PANOL-413)"
                  value={customQrCode}
                  onChange={(e) => setCustomQrCode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Nombre o etiqueta (ej: 413 - Sierra Caladora)"
                  value={customQrLabel}
                  onChange={(e) => setCustomQrLabel(e.target.value)}
                />
                <button type="submit" className="qr-generate-btn">
                  <Plus size={18} />
                  Generar QR
                </button>
              </form>

              {/* Grid of Generated QRs */}
              <div className="qr-grid">
                {qrList.map((item) => (
                  <div key={item.id} className="qr-card">
                    <div className="qr-code-wrapper">
                      <QRCodeSVG value={item.code} size={140} level="H" />
                    </div>
                    {/* Hidden canvas for PNG export */}
                    <div style={{ display: 'none' }}>
                      <QRCodeCanvas id={`qr-canvas-${item.id}`} value={item.code} size={300} level="H" />
                    </div>
                    <h4>{item.label}</h4>
                    <span>{item.code}</span>
                    <div className="qr-card-actions">
                      <button
                        type="button"
                        className="qr-dl-btn"
                        onClick={() => handleDownloadPNG(item.id, item.label)}
                      >
                        <Download size={15} />
                        Descargar PNG
                      </button>
                      <button
                        type="button"
                        className="row-action-btn"
                        title="Ver en grande"
                        onClick={() => setPreviewQR({ code: item.code, label: item.label })}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="row-action-btn delete"
                        title="Quitar de la lista"
                        onClick={() => setQrList((prev) => prev.filter((q) => q.id !== item.id))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BACK TO ADMIN DASHBOARD / HOME BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            Volver al Panel de Administración
          </button>
        </div>
      </main>

      {/* SUCCESS MODAL WITH AUTO-GENERATED CODES TABLE */}
      {modalSuccess && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={46} />
            </div>
            <h2>¡Herramientas Cargadas!</h2>
            <p style={{ marginBottom: '0.75rem' }}>{modalSuccess.message}</p>

            {modalSuccess.items && modalSuccess.items.length > 0 && (
              <div className="loaded-tools-list">
                <table className="loaded-tools-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Código (BD)</th>
                      <th style={{ width: '45%' }}>Descripción</th>
                      <th style={{ width: '30%' }}>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalSuccess.items.map((it) => (
                      <tr key={it.id}>
                        <td>
                          <span className="code-badge-green">{it.codigo}</span>
                        </td>
                        <td>{it.descripcion}</td>
                        <td style={{ textTransform: 'capitalize' }}>{it.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="success-modal-actions" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModalSuccess(null)}
              >
                Cargar Más Herramientas
              </button>
              {modalSuccess.items && modalSuccess.items.length > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ borderColor: '#6366f1', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const newQrs = modalSuccess.items.map((h) => ({
                      id: `qr-${h.id}`,
                      code: h.codigo_qr || `PANOL-QR-${h.codigo}`,
                      label: `${h.codigo} - ${h.descripcion}`
                    }));
                    setQrList((prev) => [
                      ...newQrs,
                      ...prev.filter((p) => !newQrs.some((n) => n.id === p.id))
                    ]);
                    setModalSuccess(null);
                    setActiveTab('qr');
                  }}
                >
                  <QrCode size={16} />
                  Ver / Imprimir Códigos QR
                </button>
              )}
              <button
                type="button"
                className="login-btn"
                style={{ width: 'auto', padding: '0.85rem 1.75rem' }}
                onClick={() => navigate('/admin/inventario')}
              >
                Ver en Inventario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW QR MODAL */}
      {previewQR && (
        <div className="modal-overlay">
          <div className="modal-content qr-modal-preview">
            <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Vista Previa de Etiqueta QR</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Para etiquetado físico de la herramienta en el Pañol Escolar.
            </p>
            <div className="qr-code-wrapper" style={{ margin: '0 auto 1.5rem auto', width: 'fit-content', padding: '1.5rem' }}>
              <QRCodeSVG value={previewQR.code} size={200} level="H" />
            </div>
            <h4 style={{ color: '#f8fafc', margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>{previewQR.label}</h4>
            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.95rem' }}>{previewQR.code}</span>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                type="button"
                className="login-btn"
                style={{ width: 'auto', padding: '0.75rem 2rem' }}
                onClick={() => setPreviewQR(null)}
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SHEET LABELS - ONLY VISIBLE WHEN PRINTING (window.print()) */}
      <div className="qr-print-sheet">
        {qrList.map((item) => (
          <div key={item.id} className="print-qr-item">
            <QRCodeSVG value={item.code} size={110} level="H" />
            <h5>{item.label}</h5>
            <p>{item.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CargaHerramientas;
