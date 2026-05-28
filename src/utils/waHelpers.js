const IC = require('./icons');
const _menuMaps = new Map();
const _n = i => IC.NUMS[i] || `${i + 1}.`;

async function sendText(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

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
    `_Responde con el número_ ${IC.PENCIL}`
  ];
  await sendText(sock, jid, lines.join('\n'));
}

async function sendListMessage(sock, jid, title, body, _buttonText, sections) {
  const numMap = {};
  let n = 1;
  const numbered = sections.map(sec => ({
    ...sec,
    rows: sec.rows.map(row => { numMap[String(n)] = row.id; return { ...row, _n: n++ }; })
  }));
  _menuMaps.set(jid, numMap);

  const lines = [`*${title}*`, '━━━━━━━━━━━━━━━━━━━━━━', body, ''];
  numbered.forEach(sec => {
    if (sec.title) lines.push(`${IC.BULLET} *${sec.title}*`);
    sec.rows.forEach(r => {
      lines.push(`${_n(r._n - 1)}  ${r.title}${r.description ? `  _${r.description}_` : ''}`);
    });
    lines.push('');
  });
  lines.push(`_Responde con el número_ ${IC.PENCIL}`);
  await sendText(sock, jid, lines.join('\n'));
}

async function sendDocument(sock, jid, buffer, fileName, mimetype) {
  await sock.sendMessage(jid, { document: buffer, mimetype, fileName });
}

function resolveShortcut(jid, text) {
  const t = text.trim();
  const map = _menuMaps.get(jid);
  return (map && map[t]) ? map[t] : t;
}

module.exports = { sendText, sendButtons, sendListMessage, sendDocument, resolveShortcut };
