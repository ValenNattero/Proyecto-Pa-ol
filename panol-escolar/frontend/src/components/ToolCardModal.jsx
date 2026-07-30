import React from 'react';
import { Package, Hash, Tag, Activity, Calendar, Wrench } from 'lucide-react';
import './ToolCardModal.css';

const ToolCardModal = ({ tool, onClose }) => {
  if (!tool) return null;

  return (
    <div className="tool-modal-overlay" onClick={onClose}>
      <div className="tool-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="tool-close-btn" onClick={onClose}>×</button>
        
        <div className="tool-modal-header">
          <div className="tool-icon-wrapper">
            <Wrench size={32} color="white" />
          </div>
          <h2>Ficha de Herramienta</h2>
        </div>

        <div className="tool-details-grid">
          <div className="detail-item">
            <Hash size={20} className="detail-icon" />
            <div className="detail-text">
              <span className="label">Código</span>
              <span className="value">{tool.codigo || 'N/A'}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Tag size={20} className="detail-icon" />
            <div className="detail-text">
              <span className="label">Descripción</span>
              <span className="value">{tool.descripcion}</span>
            </div>
          </div>

          <div className="detail-item">
            <Activity size={20} className="detail-icon" />
            <div className="detail-text">
              <span className="label">Estado</span>
              <span className={`value estado-${tool.estado?.replace(' ', '-')}`}>
                {tool.estado?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <Package size={20} className="detail-icon" />
            <div className="detail-text">
              <span className="label">Categoría</span>
              <span className="value">{tool.categoria}</span>
            </div>
          </div>

          <div className="detail-item">
            <Calendar size={20} className="detail-icon" />
            <div className="detail-text">
              <span className="label">Marca / Origen</span>
              <span className="value">{tool.marca || 'S/M'} / {tool.origen}</span>
            </div>
          </div>
        </div>

        <div className="tool-modal-actions">
          <button className="tool-action-btn" onClick={onClose}>Cerrar Ficha</button>
        </div>
      </div>
    </div>
  );
};

export default ToolCardModal;
