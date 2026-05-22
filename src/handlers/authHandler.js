const authService = require('../services/authService');
const { updateSession, resetSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const menuHandler = require('./menuHandler');

async function showWelcome(sock, jid) {
  await waHelpers.sendButtons(
    sock,
    jid,
    '🤖 Amelia FactBot',
    'Consulta tus ventas, clientes y artículos en tiempo real desde WhatsApp.',
    [
      { id: 'iniciar_login', text: '🔐 Iniciar sesión' },
      { id: 'ayuda',         text: '❓ Ayuda' }
    ],
    'Sistema de facturación'
  );
}

async function handleWelcome(sock, jid, messageText, session) {
  const input = messageText.trim();

  if (input === 'iniciar_login') {
    await updateSession(session.phoneNumber, { state: 'AWAITING_RUC' });
    await waHelpers.sendText(sock, jid, 'Ingresa tu *RUC o Cédula* de empresa:');
    return;
  }

  if (input === 'ayuda') {
    await waHelpers.sendText(sock, jid,
      '*AMELIA FACTBOT — AYUDA*\n\n' +
      'Para acceder al sistema:\n' +
      '1. Toca *Iniciar sesión*\n' +
      '2. Ingresa el RUC de tu empresa\n' +
      '3. Ingresa tu clave de acceso\n\n' +
      'Módulos disponibles:\n' +
      '• Ventas — facturas y resumen mensual\n' +
      '• Clientes — top 10, buscar, historial\n' +
      '• Artículos — más vendidos, buscar'
    );
    await showWelcome(sock, jid);
    return;
  }

  await showWelcome(sock, jid);
}

// Estado AWAITING_RUC: espera el número ingresado por el usuario
async function handleRuc(sock, jid, messageText, session) {
  const cleanInput = messageText.trim();

  const company = await authService.getCompanyByRuc(cleanInput);

  if (company) {
    await updateSession(session.phoneNumber, {
      tempRuc: cleanInput,
      state: 'AWAITING_PASSWORD'
    });
    await waHelpers.sendText(sock, jid, `Empresa: *${company.COM_NOMBRE}*\n\nIngresa tu *clave* de acceso:`);
  } else {
    await waHelpers.sendText(sock, jid, "❌ RUC o Cédula no registrado. Inténtalo nuevamente:");
  }
}

async function handlePassword(sock, jid, messageText, session) {
  const password = messageText.trim();
  const tempRuc = session.tempRuc;

  if (!tempRuc) {
    await resetSession(session.phoneNumber);
    await showWelcome(sock, jid);
    return;
  }

  const company = await authService.getCompanyByRuc(tempRuc);
  if (!company) {
    await resetSession(session.phoneNumber);
    await showWelcome(sock, jid);
    return;
  }

  const user = await authService.validateUser(company.COM_CODIGO, tempRuc, password);

  if (user) {
    await updateSession(session.phoneNumber, {
      state: 'MAIN_MENU',
      COM_CODIGO: company.COM_CODIGO,
      tempRuc: null
    });
    await waHelpers.sendText(sock, jid, `✅ Bienvenido, *${company.COM_NOMBRE}*`);
    await menuHandler.showMainMenu(sock, jid, company.COM_CODIGO);
  } else {
    await resetSession(session.phoneNumber);
    await waHelpers.sendText(sock, jid, "❌ Clave incorrecta. Por seguridad se reinició el flujo.");
    await showWelcome(sock, jid);
  }
}

module.exports = { handleWelcome, handleRuc, handlePassword, showWelcome };
