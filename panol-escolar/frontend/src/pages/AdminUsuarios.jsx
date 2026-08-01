import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../utils/storage';
import { UserPlus, Key, Trash2, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import '../App.css';

function AdminUsuarios() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal para crear nuevo usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    cargo: 'Administrador Pañol'
  });

  // Modal para cambiar contraseña
  const [showPassModal, setShowPassModal] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    const isSuper = currentSession && (
      currentSession.isSuperAdmin ||
      currentSession.username === 'SalvucciPablo' ||
      currentSession.cargo === 'ADMINISTRADOR PRINCIPAL' ||
      currentSession.cargo === 'SUPER_ADMIN' ||
      (currentSession.nombre === 'Pablo' && currentSession.apellido === 'Salvucci')
    );

    if (!isSuper) {
      alert("Acceso restringido: Solo el Super Administrador SalvucciPablo puede gestionar usuarios admin.");
      navigate('/admin');
      return;
    }

    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/admins/');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        setErrorMsg('Error al cargar la lista de administradores.');
      }
    } catch (err) {
      console.error("Error cargando usuarios admin:", err);
      // Fallback si no está conectado el servidor
      setAdmins([
        { id: 1, username: 'SalvucciPablo', nombre: 'Pablo', apellido: 'Salvucci', cargo: 'ADMINISTRADOR PRINCIPAL' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newAdmin.username || !newAdmin.password || !newAdmin.nombre || !newAdmin.apellido) {
      setErrorMsg('Todos los campos obligatorios deben estar completos.');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/admins/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });

      if (res.ok) {
        setSuccessMsg(`Usuario "${newAdmin.username}" creado exitosamente.`);
        setShowCreateModal(false);
        setNewAdmin({ username: '', password: '', nombre: '', apellido: '', cargo: 'Administrador Pañol' });
        fetchAdmins();
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.detail || 'No se pudo crear el usuario.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión al crear el usuario.');
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword.trim()) {
      setErrorMsg('La contraseña no puede estar vacía.');
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/admins/${targetAdmin.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() })
      });

      if (res.ok) {
        setSuccessMsg(`Contraseña actualizada correctamente para el usuario "${targetAdmin.username}".`);
        setShowPassModal(false);
        setTargetAdmin(null);
        setNewPassword('');
      } else {
        setErrorMsg('No se pudo actualizar la contraseña.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión al cambiar la contraseña.');
    }
  };

  const handleDeleteAdmin = async (adminObj) => {
    if (adminObj.username === 'SalvucciPablo') {
      alert("No se puede dar de baja al Super Administrador principal.");
      return;
    }

    if (!window.confirm(`¿Está seguro de que desea dar de baja y eliminar al administrador "${adminObj.username}" (${adminObj.nombre} ${adminObj.apellido})?`)) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`http://127.0.0.1:8000/admins/${adminObj.id}`, {
        method: 'DELETE'
      });

      if (res.ok || res.status === 204) {
        setSuccessMsg(`El usuario administrador "${adminObj.username}" ha sido dado de baja correctamente.`);
        fetchAdmins();
      } else {
        setErrorMsg('Error al dar de baja el usuario.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="app-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>

      <main className="main-card" style={{ maxWidth: '1050px', width: '95%', padding: '2.5rem' }}>
        <header className="welcome-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '2.2rem', color: '#fff' }}>
              <Shield size={32} color="#f59e0b" /> Gestión de Usuarios Admin
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              Super Administrador principal: <strong>SalvucciPablo</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setShowCreateModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.9rem 1.6rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={20} /> Crear Nuevos Usuarios
          </button>
        </header>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={20} color="#10b981" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <section style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '2rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando usuarios administradores...</p>
          ) : admins.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No se encontraron usuarios administrativos.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '700' }}>Usuario</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '700' }}>Nombre y Apellido</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '700' }}>Cargo</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '700', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adm) => {
                    const isSuper = (adm.username === 'SalvucciPablo');
                    return (
                      <tr key={adm.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <td style={{ padding: '1.1rem 1.25rem', color: '#fff', fontWeight: '700' }}>
                          {adm.username}
                          {isSuper && (
                            <span style={{ marginLeft: '0.6rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '800' }}>
                              SUPER ADMIN
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem', color: '#e2e8f0' }}>
                          {adm.nombre} {adm.apellido}
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {adm.cargo}
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetAdmin(adm);
                                setNewPassword('');
                                setShowPassModal(true);
                              }}
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                padding: '0.5rem 0.9rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.85rem'
                              }}
                              title="Cambiar Contraseña"
                            >
                              <Key size={15} /> Contraseña
                            </button>

                            {!isSuper && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAdmin(adm)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#f87171',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  padding: '0.5rem 0.9rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.85rem'
                                }}
                                title="Dar de Baja / Eliminar Usuario"
                              >
                                <Trash2 size={15} /> Baja
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="back-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            padding: '0.8rem 1.4rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={18} /> Volver al Panel de Administración
        </button>

        {/* MODAL CREAR USUARIO ADMIN */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%', background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                <UserPlus size={24} color="#10b981" /> Crear Nuevo Usuario Admin
              </h2>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                    NOMBRE DE USUARIO (Para iniciar sesión) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: gonzalezjuan"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                    CONTRASEÑA INICIAL *
                  </label>
                  <input
                    type="password"
                    placeholder="Contraseña del usuario admin"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                      NOMBRE *
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={newAdmin.nombre}
                      onChange={(e) => setNewAdmin({ ...newAdmin, nombre: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                      APELLIDO *
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={newAdmin.apellido}
                      onChange={(e) => setNewAdmin({ ...newAdmin, apellido: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                    CARGO / ROL
                  </label>
                  <input
                    type="text"
                    value={newAdmin.cargo}
                    onChange={(e) => setNewAdmin({ ...newAdmin, cargo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="cancel-btn"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="login-btn"
                    style={{ background: '#10b981', color: '#fff', border: 'none' }}
                  >
                    Crear Usuario Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CAMBIAR CONTRASEÑA */}
        {showPassModal && targetAdmin && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px', width: '90%', background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', marginTop: 0, marginBottom: '1.25rem', fontSize: '1.4rem' }}>
                <Key size={22} color="#60a5fa" /> Nueva Contraseña
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Cambiando la contraseña de acceso del usuario administrador: <strong style={{ color: '#fff' }}>{targetAdmin.username}</strong>
              </p>

              <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                    NUEVA CONTRASEÑA *
                  </label>
                  <input
                    type="password"
                    placeholder="Ingrese la nueva contraseña..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassModal(false);
                      setTargetAdmin(null);
                    }}
                    className="cancel-btn"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="login-btn"
                    style={{ background: '#3b82f6', color: '#fff', border: 'none' }}
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminUsuarios;
