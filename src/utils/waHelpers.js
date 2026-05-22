const _menuMaps = new Map();
const _NUM = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
const _n = i => _NUM[i] || `${i + 1}.`;

async function sendText(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

// ── Menú de botones (texto enriquecido) ──────────────────────────────────────
async function sendButtons(sock, jid, title, body, buttons, subtitle = '') {
  const numMap = {};
  buttons.forEach((btn, i) => { numMap[String(i + 1)] = btn.id; });
  _menuMaps.set(jid, numMap);

  const header = subtitle ? `*${title}*\n_${subtitle}_` : `*${title}*`;
  const lines = [
    header,
    '━━━━━━━━━━━━━━━━━━━━━━',
    body,
    '',
    ...buttons.map((btn, i) => `${_n(i)}  ${btn.text}`),
    '',
    '_Responde con el número_ ✏️'
  ];
  await sendText(sock, jid, lines.join('\n'));
}

// ── Menú de lista con secciones (texto enriquecido) ──────────────────────────
async function sendListMessage(sock, jid, title, body, _buttonText, sections) {
  const numMap = {};
  let n = 1;
  const numbered = sections.map(sec => ({
    ...sec,
    rows: sec.rows.map(row => { numMap[String(n)] = row.id; return { ...row, _n: n++ }; })
  }));
  _menuMaps.set(jid, numMap);

  const lines = [
    `*${title}*`,
    '━━━━━━━━━━━━━━━━━━━━━━',
    body,
    ''
  ];
  numbered.forEach(sec => {
    if (sec.title) lines.push(`▪️ *${sec.title}*`);
    sec.rows.forEach(r => {
      lines.push(`${_n(r._n - 1)}  ${r.title}${r.description ? `  _${r.description}_` : ''}`);
    });
    lines.push('');
  });
  lines.push('_Responde con el número_ ✏️');
  await sendText(sock, jid, lines.join('\n'));
}

function resolveShortcut(jid, text) {
  const t = text.trim();
  const map = _menuMaps.get(jid);
  return (map && map[t]) ? map[t] : t;
}

module.exports = { sendText, sendButtons, sendListMessage, resolveShortcut };
