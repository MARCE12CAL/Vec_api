// Sesiones en memoria — no requiere base de datos local
const sessions = new Map();

function buildDefaultSession(phoneNumber) {
  return {
    phoneNumber,
    state: 'WELCOME',
    COM_CODIGO: null,
    tempRuc: null,
    update(fields) {
      Object.assign(this, fields);
      return this;
    }
  };
}

async function getSession(phoneNumber) {
  if (!sessions.has(phoneNumber)) {
    sessions.set(phoneNumber, buildDefaultSession(phoneNumber));
  }
  return sessions.get(phoneNumber);
}

async function updateSession(phoneNumber, updates) {
  const session = await getSession(phoneNumber);
  Object.assign(session, updates);
  return session;
}

async function resetSession(phoneNumber) {
  const session = buildDefaultSession(phoneNumber);
  sessions.set(phoneNumber, session);
  return session;
}

module.exports = { getSession, updateSession, resetSession };
