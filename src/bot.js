const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidGroup,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const { routeMessage } = require('./handlers');

const logger = pino({ level: 'silent' });

async function startWhatsAppBot() {
  console.log('⏳ Inicializando sesión de WhatsApp...');

  const authDir = path.resolve(__dirname, '../auth_info_baileys');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`ℹ️ Baileys v${version.join('.')}, latest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: undefined,
  });

  // ── Conexión ────────────────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();
      console.log('================================================================');
      console.log('👉 ESCANEA ESTE CÓDIGO QR EN TU WHATSAPP PARA CONECTAR EL BOT 👈');
      console.log('================================================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n================================================================');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;
      console.log(`⚠️ Conexión cerrada: ${lastDisconnect?.error || 'Desconocido'}. Reconectando: ${shouldReconnect}`);
      if (shouldReconnect) startWhatsAppBot();
      else console.log('🚪 Sesión cerrada. Elimina "auth_info_baileys" para reconectar.');
    } else if (connection === 'open') {
      console.log('✅ ¡Amelia FactBot conectado y listo!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Mensajes entrantes ──────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async (mUpsert) => {
    const { messages, type } = mUpsert;
    if (type !== 'notify') return;

    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;

      const jid = m.key.remoteJid;
      if (isJidGroup(jid)) continue;

      const messageText = getMessageText(m);
      if (!messageText) continue;

      const senderName = m.pushName || 'Usuario';
      console.log(`💬 ${senderName} (${jid.split('@')[0]}): "${messageText}"`);

      try {
        await routeMessage(sock, jid, messageText);
      } catch (error) {
        console.error('❌ Error al enrutar mensaje:', error);
        await sock.sendMessage(jid, {
          text: '❌ Error interno. Inténtalo nuevamente o escribe *volver*.'
        });
      }
    }
  });
}

function getMessageText(m) {
  if (!m.message) return '';
  const type = Object.keys(m.message)[0];

  if (type === 'conversation')        return m.message.conversation;
  if (type === 'extendedTextMessage') return m.message.extendedTextMessage.text;
  if (type === 'imageMessage')        return m.message.imageMessage.caption || '';

  if (type === 'buttonsResponseMessage')
    return m.message.buttonsResponseMessage.selectedButtonId;
  if (type === 'templateButtonReplyMessage')
    return m.message.templateButtonReplyMessage.selectedId;

  if (type === 'interactiveResponseMessage') {
    const interactive = m.message.interactiveResponseMessage;
    const native = interactive?.nativeFlowResponseMessage;
    if (native) {
      try { return JSON.parse(native.paramsJson).id; } catch { /* ignorar */ }
    }
    const list = interactive?.listResponseMessage;
    if (list) return list.singleSelectReply.selectedRowId;
  }

  if (type === 'listResponseMessage')
    return m.message.listResponseMessage.singleSelectReply.selectedRowId;

  return '';
}

module.exports = { startWhatsAppBot };
