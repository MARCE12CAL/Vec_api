/**
 * Vista previa local de Amelia FactBot — no envía nada por WhatsApp.
 * Ejecutar: npm run preview:wa
 */
const fs = require('fs');
const path = require('path');
const { buildAmeliaPreview } = require('../src/preview/ameliaPreview');

function waTextToHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');
}

function bubbleHtml(text, who) {
  return `<div class="bubble ${who}">${waTextToHtml(text)}</div>`;
}

function buildHtml(items) {
  const out = [];
  let cardOpen = false;
  let menuOpen = false;

  const closeCard = () => {
    if (cardOpen) {
      out.push('</div>');
      cardOpen = false;
    }
  };
  const closeMenu = () => {
    if (menuOpen) {
      out.push('</div>');
      menuOpen = false;
    }
  };

  for (const item of items) {
    if (item.type === 'part') {
      closeCard();
      closeMenu();
      out.push(`<div class="part">${waTextToHtml(item.title)}</div>`);
      continue;
    }
    if (item.type === 'menuLabel') {
      closeCard();
      closeMenu();
      out.push(`<div class="menu-block"><div class="menu-label">📋 ${waTextToHtml(item.title)}</div>`);
      menuOpen = true;
      continue;
    }
    if (item.type === 'option') {
      closeMenu();
      closeCard();
      const num = item.num === '—' ? 'Paso' : `Opción ${item.num}`;
      out.push(
        `<div class="option-card"><div class="option-title">${num} — ${waTextToHtml(item.label)}</div>`
      );
      cardOpen = true;
      continue;
    }
    if (item.type === 'bot' && menuOpen) {
      out.push(bubbleHtml(item.text, 'bot'));
      continue;
    }
    if (!cardOpen) {
      closeMenu();
      out.push('<div class="option-card"><div class="option-title">Detalle</div>');
      cardOpen = true;
    }
    if (item.type === 'botLabel') {
      out.push(`<div class="step-label bot-label">🤖 ${waTextToHtml(item.text)}</div>`);
    } else if (item.type === 'user') {
      out.push('<div class="step-label user-label">👤 Usuario escribe:</div>');
      out.push(bubbleHtml(item.text, 'user'));
    } else if (item.type === 'bot') {
      out.push(bubbleHtml(item.text, 'bot'));
    }
  }
  closeCard();
  closeMenu();
  const html = out.join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Amelia FactBot — Guía de mensajes WhatsApp</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Helvetica, Arial, sans-serif;
      background: #e5ddd5;
      padding: 16px;
    }
    .header {
      max-width: 480px;
      margin: 0 auto 12px;
      background: #075e54;
      color: #fff;
      padding: 14px 16px;
      border-radius: 8px;
      font-weight: 600;
    }
    .header small { display: block; font-weight: 400; opacity: .9; font-size: 12px; margin-top: 6px; line-height: 1.4; }
    .chat {
      max-width: 480px;
      margin: 0 auto;
      background: #efeae2;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,.12);
    }
    .part {
      background: #075e54;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 12px;
      margin: 20px 0 12px;
      border-radius: 6px;
    }
    .part:first-child { margin-top: 0; }
    .menu-block {
      background: #f0f8f0;
      border: 1px solid #c8e6c9;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 14px;
    }
    .menu-label {
      font-size: 12px;
      font-weight: 600;
      color: #2e7d32;
      margin-bottom: 8px;
    }
    .option-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .option-title {
      font-size: 13px;
      font-weight: 700;
      color: #075e54;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid #d9fdd3;
    }
    .step-label {
      font-size: 11px;
      font-weight: 600;
      margin: 8px 0 4px;
    }
    .user-label { color: #1b7a3d; }
    .bot-label { color: #027eb5; }
    .bubble {
      padding: 8px 10px;
      font-size: 14px;
      line-height: 1.45;
      max-width: 95%;
      word-wrap: break-word;
      box-shadow: 0 1px 0.5px rgba(0,0,0,.1);
    }
    .bubble.bot {
      background: #fff;
      border-radius: 8px 8px 8px 0;
      margin-bottom: 6px;
    }
    .bubble.user {
      background: #d9fdd3;
      border-radius: 8px 8px 0 8px;
      margin-left: auto;
      margin-bottom: 6px;
    }
    .hint {
      max-width: 480px;
      margin: 16px auto 0;
      font-size: 13px;
      color: #54656f;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    Amelia FactBot — Guía por sección
    <small>Cada bloque muestra el menú que aparece y, por cada opción (1, 2, 3…), qué escribe el usuario y qué responde el bot.</small>
  </div>
  <div class="chat">${html}</div>
  <p class="hint"><code>npm run preview:wa</code> para regenerar · Datos ejemplo en <code>src/preview/previewSamples.js</code></p>
</body>
</html>`;
}

async function run() {
  const items = await buildAmeliaPreview();
  const outDir = path.join(__dirname, '../preview');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, 'amelia-preview.html');
  fs.writeFileSync(htmlPath, buildHtml(items), 'utf8');
  console.log('\n  Vista previa generada.\n  Abre: ' + htmlPath + '\n');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
