const SESSION_KEY = 'panol_session';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const API_URL = 'http://127.0.0.1:8000';

export const saveSession = (usuario) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...usuario,
    timestamp: Date.now()
  }));
};

export const getSession = () => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  const session = JSON.parse(data);
  if (Date.now() - session.timestamp > SESSION_TIMEOUT) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  // Renueva la sesión por otros 15 minutos
  const activeUser = { nombre: session.nombre, apellido: session.apellido, cargo: session.cargo, token: session.token };
  saveSession(activeUser);
  return activeUser;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const saveRetiros = async (solicitante, herramientasIds) => {
  if (!solicitante || herramientasIds.length === 0) return;
  const session = getSession();
  if (!session || !session.token) throw new Error("No hay sesión activa");
  
  const payload = {
    herramientas_ids: herramientasIds,
    nombre_solicitante: solicitante.nombre,
    apellido_solicitante: solicitante.apellido,
    cargo_solicitante: solicitante.cargo,
    observacion: ""
  };

  const response = await fetch(`${API_URL}/prestamos/retiro/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al registrar retiro');
  }
  
  return await response.json();
};

export const getRetiros = async (solicitante = null) => {
  const session = getSession();
  if (!session || !session.token) return [];
  
  const params = new URLSearchParams();
  if (solicitante && solicitante.nombre) params.append('nombre', solicitante.nombre);
  if (solicitante && solicitante.apellido) params.append('apellido', solicitante.apellido);
  if (solicitante && solicitante.cargo) params.append('cargo', solicitante.cargo);

  try {
    const response = await fetch(`${API_URL}/prestamos/pendientes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data; // Returns list of Prestamos
    }
  } catch (err) {
    console.error("Error fetching pendientes:", err);
  }
  return [];
};

export const clearRetiros = async (herramientasDevueltasIds, solicitante = null) => {
  if (herramientasDevueltasIds.length === 0) return;
  const session = getSession();
  if (!session || !session.token) throw new Error("No hay sesión activa");
  
  const payload = {
    prestamos_ids: herramientasDevueltasIds,
    nombre_solicitante: solicitante?.nombre || null,
    apellido_solicitante: solicitante?.apellido || null,
    cargo_solicitante: solicitante?.cargo || null
  };

  const response = await fetch(`${API_URL}/prestamos/devolucion/bulk`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al registrar devolución');
  }
  
  return await response.json();
};
