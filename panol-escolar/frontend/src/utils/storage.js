const SESSION_KEY = 'panol_session';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

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
  const activeUser = { nombre: session.nombre, apellido: session.apellido, cargo: session.cargo };
  saveSession(activeUser);
  return activeUser;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const RETIROS_KEY = 'panol_retiros';

export const saveRetiros = (usuario, herramientas) => {
  if (!usuario || herramientas.length === 0) return;
  const retiros = JSON.parse(localStorage.getItem(RETIROS_KEY) || '{}');
  const userId = `${usuario.nombre}-${usuario.apellido}-${usuario.cargo}`.toLowerCase();
  
  if (!retiros[userId]) retiros[userId] = [];
  retiros[userId] = [...retiros[userId], ...herramientas];
  
  localStorage.setItem(RETIROS_KEY, JSON.stringify(retiros));
};

export const getRetiros = (usuario) => {
  if (!usuario) return [];
  const retiros = JSON.parse(localStorage.getItem(RETIROS_KEY) || '{}');
  const userId = `${usuario.nombre}-${usuario.apellido}-${usuario.cargo}`.toLowerCase();
  return retiros[userId] || [];
};

export const clearRetiros = (usuario, herramientasDevueltas) => {
  if (!usuario || herramientasDevueltas.length === 0) return;
  const retiros = JSON.parse(localStorage.getItem(RETIROS_KEY) || '{}');
  const userId = `${usuario.nombre}-${usuario.apellido}-${usuario.cargo}`.toLowerCase();
  
  if (retiros[userId]) {
      const devueltosIds = herramientasDevueltas.map(h => h.codigo);
      retiros[userId] = retiros[userId].filter(codigo => !devueltosIds.includes(codigo));
      localStorage.setItem(RETIROS_KEY, JSON.stringify(retiros));
  }
};
