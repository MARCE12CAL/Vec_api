/**
 * Vista previa: por cada sección → menú que aparece → cada opción (qué pone el usuario + respuesta del bot).
 */
require('dotenv').config();

const authHandler = require('../handlers/authHandler');
const menuHandler = require('../handlers/menuHandler');
const salesHandler = require('../handlers/salesHandler');
const clientsHandler = require('../handlers/clientsHandler');
const articlesHandler = require('../handlers/articlesHandler');
const waHelpers = require('../utils/waHelpers');
const samples = require('./previewSamples');
const { fmt, fmtDate } = require('../utils/dateHelpers');

const PREVIEW_JID = 'preview@local';
const session = { COM_CODIGO: 42, phoneNumber: PREVIEW_JID };

function createCapture() {
  const items = [];
  const sock = {
    async sendMessage(_jid, { text }) {
      items.push({ type: 'bot', text });
    },
  };

  return {
    sock,
    items,
    part: (title) => items.push({ type: 'part', title }),
    menu: (title) => items.push({ type: 'menuLabel', title }),
    option: (num, label) => items.push({ type: 'option', num, label }),
    user: (text) => items.push({ type: 'user', text }),
    jid: PREVIEW_JID,
  };
}

async function showMainMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    samples.empresaNombre,
    '¿Qué deseas consultar?',
    'Ver opciones',
    [
      {
        title: 'Módulos',
        rows: [
          { id: 'ventas', title: '📊 Ventas', description: 'Facturas y resumen mensual' },
          { id: 'clientes', title: '👥 Clientes', description: 'Top 10 · Buscar · Historial' },
          { id: 'articulos', title: '📦 Artículos', description: 'Más vendidos · Buscar' },
        ],
      },
      {
        title: 'Sesión',
        rows: [{ id: 'logout', title: '🚪 Cerrar sesión', description: '' }],
      },
    ]
  );
}

async function buildAmeliaPreview() {
  const ctx = createCapture();
  const { sock, items, part, menu, option, user, jid } = ctx;
  const { summaryLabels } = samples;

  // ═══════════════════════════════════════════════════════════════════════════
  part('1. INICIO — Bienvenida (sin sesión)');
  menu('Menú que aparece al escribir hola o cualquier mensaje');
  await authHandler.showWelcome(sock, jid);

  option(1, '🔐 Iniciar sesión');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, 'Ingresa tu *RUC o Cédula* de empresa:');

  option(2, '❓ Ayuda');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
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

  part('1b. INICIO — Tras elegir Iniciar sesión');
  option('—', 'Usuario escribe el RUC');
  user('1791234567001');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, `Empresa: *${samples.empresaNombre}*\n\nIngresa tu *clave* de acceso:`);

  option('—', 'Usuario escribe la clave');
  user('admin123');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, `✅ Bienvenido, *${samples.empresaNombre}*`);

  // ═══════════════════════════════════════════════════════════════════════════
  part('2. MENÚ PRINCIPAL (logueado)');
  menu('Menú que aparece tras login exitoso');
  await showMainMenu(sock, jid);

  option(1, '📊 Ventas');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → abre menú Ventas' });
  await menuHandler.showSalesMenu(sock, jid);

  option(2, '👥 Clientes');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → abre menú Clientes' });
  await menuHandler.showClientsMenu(sock, jid);

  option(3, '📦 Artículos');
  user('3');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → abre menú Artículos' });
  await menuHandler.showArticlesMenu(sock, jid);

  option(4, '🚪 Cerrar sesión');
  user('4');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🚪 Sesión cerrada. Envía cualquier mensaje para volver a ingresar.');

  // ═══════════════════════════════════════════════════════════════════════════
  part('3. VENTAS — Menú');
  menu('Menú Ventas (opción 1 del menú principal)');
  await menuHandler.showSalesMenu(sock, jid);

  option(1, '🧾 Detallado por factura');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → submenú filtros' });
  menu('Submenú que aparece (Ventas detalladas)');
  await salesHandler.showDetailFilterMenu(sock, jid);

  // --- Ventas detallado: opción 1 ---
  option(1, '🔢 Por N° de factura');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🔢 Ingresa el *N° de factura* exacto:');
  option('—', 'Usuario escribe el número');
  user('12');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando factura...');
  await salesHandler.sendInvoiceCard(sock, jid, samples.invoiceDetail, session);

  // --- Ventas detallado: opción 2 ---
  option(2, '👤 Por nombre de cliente');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '👤 Ingresa el *nombre del cliente* (o parte):');
  option('—', 'Usuario escribe el nombre');
  user('farmacia');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  await salesHandler.sendInvoiceList(sock, jid, samples.invoiceList);
  option('—', 'Usuario elige factura de la lista');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Cargando factura...');
  await salesHandler.sendInvoiceCard(sock, jid, samples.invoiceDetail, session);

  // --- Ventas detallado: opción 3 ---
  option(3, '🪪 Por RUC del cliente');
  user('3');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🪪 Ingresa el *RUC o cédula* exacta:');
  option('—', 'Usuario escribe el RUC');
  user('1791234567001');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  await salesHandler.sendInvoiceList(sock, jid, samples.invoiceList);

  // --- Ventas detallado: opción 4 ---
  option(4, '📅 Por rango de fechas');
  user('4');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de inicio* (dd/mm/aaaa):');
  option('—', 'Usuario escribe fecha inicio');
  user('01/05/2025');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de fin* (dd/mm/aaaa):');
  option('—', 'Usuario escribe fecha fin');
  user('31/05/2025');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  await salesHandler.sendInvoiceList(sock, jid, samples.invoiceList);

  // --- Ventas: opción 2 resumen ---
  part('3b. VENTAS — Resumen mensual (opción 2 del menú Ventas)');
  menu('Menú Ventas');
  await menuHandler.showSalesMenu(sock, jid);
  option(2, '📊 Resumen mensual');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → submenú períodos' });
  menu('Submenú que aparece (Resumen mensual)');
  await salesHandler.showSummaryPeriodMenu(sock, jid);

  option(1, '📅 Este mes');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, `⏳ Calculando resumen *${summaryLabels.esteMes}*...`);
  await salesHandler.sendSummaryCard(sock, jid, samples.summaryMayo2025, summaryLabels.esteMes);

  option(2, '📅 Mes anterior');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await salesHandler.sendSummaryCard(sock, jid, samples.summaryMayo2025, summaryLabels.mesAnterior);

  option(3, '📆 Último trimestre');
  user('3');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await salesHandler.sendSummaryCard(sock, jid, samples.summaryMayo2025, summaryLabels.trimestre);

  option(4, '📆 Este año');
  user('4');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await salesHandler.sendSummaryCard(sock, jid, samples.summaryMayo2025, summaryLabels.anio);

  option(5, '🗓️ Rango libre');
  user('5');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de inicio* del resumen (dd/mm/aaaa):');
  option('—', 'Usuario escribe fecha inicio');
  user('01/05/2025');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de fin* (dd/mm/aaaa):');
  option('—', 'Usuario escribe fecha fin');
  user('31/05/2025');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await salesHandler.sendSummaryCard(sock, jid, samples.summaryMayo2025, summaryLabels.rango);

  // ═══════════════════════════════════════════════════════════════════════════
  part('4. CLIENTES — Menú');
  menu('Menú Clientes (opción 2 del menú principal)');
  await menuHandler.showClientsMenu(sock, jid);

  option(1, '🏆 Top 10 por monto');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Consultando top clientes del mes...');
  await clientsHandler.sendTopClientsList(sock, jid, samples.topClients, 'Mayo 2025');
  option('—', 'Usuario elige un cliente del ranking');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha del cliente' });
  await clientsHandler.showClientCard(sock, jid, samples.clientFarmacia, session, samples.clientSummary);
  option(1, '🧾 Historial de facturas (en ficha cliente)');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Cargando historial...');
  const histRows = samples.clientInvoices.map((f) => ({
    id: `inv_cli_${f.codigo}`,
    title: `#${f.codigo} — ${fmt(f.total)}`,
    description: fmtDate(f.fecha),
  }));
  await waHelpers.sendListMessage(sock, jid,
    'HISTORIAL DE FACTURAS',
    `Últimas *${samples.clientInvoices.length}* facturas del cliente:`,
    'Ver facturas',
    [{ title: 'Facturas', rows: histRows }]
  );

  option(2, '🔍 Buscar cliente');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → submenú búsqueda' });
  menu('Submenú que aparece (Buscar cliente)');
  await clientsHandler.showSearchCriteriaMenu(sock, jid);

  option(1, '👤 Por nombre o razón social');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '👤 Ingresa el *nombre o razón social* (o parte):');
  option('—', 'Usuario escribe el nombre');
  user('farmacia');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando clientes...');
  const cliRows = samples.clientSearchResults.map((c) => ({
    id: `cli_sel_${c.codigo}`,
    title: c.nombre,
    description: `RUC: ${c.ruc}`,
  }));
  await waHelpers.sendListMessage(sock, jid,
    'RESULTADOS',
    `*${samples.clientSearchResults.length}* clientes encontrados. Selecciona uno:`,
    'Ver cliente',
    [{ title: 'Clientes', rows: cliRows }]
  );
  option('—', 'Usuario elige cliente de la lista');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha' });
  await clientsHandler.showClientCard(sock, jid, samples.clientFarmacia, session, samples.clientSummary);

  option(2, '🪪 Por RUC o cédula exacta');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🪪 Ingresa el *RUC o cédula* exacta:');
  option('—', 'Usuario escribe el RUC');
  user('1791234567001');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando cliente...');
  await clientsHandler.showClientCard(sock, jid, samples.clientFarmacia, session, samples.clientSummary);

  // ═══════════════════════════════════════════════════════════════════════════
  part('5. ARTÍCULOS — Menú');
  menu('Menú Artículos (opción 3 del menú principal)');
  await menuHandler.showArticlesMenu(sock, jid);

  option(1, '📈 Top 10 por unidades');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Consultando top por unidades...');
  await articlesHandler.sendTopArticlesList(
    sock, jid, samples.topArticlesUnidades, 'TOP UNIDADES — Mayo 2025', 'unidades'
  );

  option(2, '💰 Top 10 por monto');
  user('2');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Consultando top por monto...');
  await articlesHandler.sendTopArticlesList(
    sock, jid, samples.topArticlesMonto, 'TOP MONTO — Mayo 2025', 'monto'
  );
  option('—', 'Usuario elige artículo del ranking');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha artículo' });
  await articlesHandler.showArticleCard(sock, jid, samples.articleParacetamol, session);
  option(1, '📈 Ver ventas recientes (en ficha artículo)');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Cargando ventas recientes...');
  await waHelpers.sendText(sock, jid, samples.articleSalesText);

  option(3, '🔍 Buscar por nombre');
  user('3');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🔍 Ingresa el *nombre del artículo* (o parte):');
  option('—', 'Usuario escribe el nombre');
  user('paracetamol');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando artículos...');
  const artRows = samples.articleSearchResults.map((a) => ({
    id: `art_sel_${a.codigo}`,
    title: a.nombre,
    description: `Cód: ${a.codPpal} · ${a.grupo}`,
  }));
  await waHelpers.sendListMessage(sock, jid,
    'RESULTADOS',
    `*${samples.articleSearchResults.length}* artículos encontrados. Selecciona uno:`,
    'Ver artículo',
    [{ title: 'Artículos', rows: artRows }]
  );
  option('—', 'Usuario elige artículo');
  user('1');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha' });
  await articlesHandler.showArticleCard(sock, jid, samples.articleParacetamol, session);

  option(4, '🏷️ Buscar por código');
  user('4');
  items.push({ type: 'botLabel', text: 'Respuesta del bot' });
  await waHelpers.sendText(sock, jid, '🏷️ Ingresa el *código principal* exacto:');
  option('—', 'Usuario escribe el código');
  user('MED001');
  items.push({ type: 'botLabel', text: 'Respuesta del bot → ficha' });
  await waHelpers.sendText(sock, jid, '⏳ Buscando artículo...');
  await articlesHandler.showArticleCard(sock, jid, samples.articleParacetamol, session);

  return items;
}

module.exports = { buildAmeliaPreview };
