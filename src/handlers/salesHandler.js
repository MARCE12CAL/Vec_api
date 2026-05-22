const salesService = require('../services/salesService');
const clientsHandler = require('./clientsHandler');
const { updateSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const { showSalesMenu, showMainMenu } = require('./menuHandler');
const { getMonthRange, getQuarterRange, getYearRange, fmt, fmtDate, parseDateStr } = require('../utils/dateHelpers');

async function handleSalesMenu(sock, jid, text, session) {
  switch (text) {
    case 'ventas_detallado':
      await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
      await showDetailFilterMenu(sock, jid);
      break;
    case 'ventas_resumen':
      await updateSession(jid, { state: 'SALES_SUMMARY_MENU' });
      await showSummaryPeriodMenu(sock, jid);
      break;
    case 'volver_menu':
      await updateSession(jid, { state: 'MAIN_MENU' });
      await showMainMenu(sock, jid, session.COM_CODIGO);
      break;
    default:
      await showSalesMenu(sock, jid);
  }
}

async function showDetailFilterMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'VENTAS DETALLADAS',
    '¿Cómo deseas buscar?',
    'Seleccionar filtro',
    [
      {
        title: 'Filtros de búsqueda',
        rows: [
          { id: 'filter_numero',   title: '🔢 Por N° de factura',    description: 'Número exacto de comprobante' },
          { id: 'filter_cli_name', title: '👤 Por nombre de cliente', description: 'Búsqueda parcial por texto' },
          { id: 'filter_cli_ruc',  title: '🪪 Por RUC del cliente',   description: 'Identificación tributaria exacta' },
          { id: 'filter_fechas',   title: '📅 Por rango de fechas',   description: 'Define fecha inicio y fin' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'ventas_menu', title: '← Ventas', description: '' }]
      }
    ]
  );
}

async function showSummaryPeriodMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'RESUMEN MENSUAL',
    '¿Qué período deseas consultar?',
    'Seleccionar período',
    [
      {
        title: 'Períodos predefinidos',
        rows: [
          { id: 'sum_este_mes',     title: '📅 Este mes',         description: 'Mes en curso' },
          { id: 'sum_mes_anterior', title: '📅 Mes anterior',     description: 'Período anterior completo' },
          { id: 'sum_trimestre',    title: '📆 Último trimestre', description: 'Últimos 3 meses' },
          { id: 'sum_anio',         title: '📆 Este año',         description: 'Desde enero hasta hoy' }
        ]
      },
      {
        title: 'Personalizado',
        rows: [
          { id: 'sum_rango',    title: '🗓️ Rango libre', description: 'Define fechas inicio y fin' },
          { id: 'ventas_menu',  title: '← Ventas',       description: '' }
        ]
      }
    ]
  );
}

async function handleDetailFilter(sock, jid, text, session) {
  if (text.startsWith('inv_sel_')) {
    await handleInvoiceSelection(sock, jid, text, session);
    return;
  }
  if (text.startsWith('cli_sel_')) {
    await updateSession(jid, { state: 'CLIENT_DETAIL' });
    await clientsHandler.handleClientSelection(sock, jid, text, session);
    return;
  }
  if (text === 'volver_menu') {
    await updateSession(jid, { state: 'MAIN_MENU' });
    await showMainMenu(sock, jid, session.COM_CODIGO);
    return;
  }
  switch (text) {
    case 'filter_numero':
      await updateSession(jid, { state: 'AWAITING_INVOICE_NUMBER' });
      await waHelpers.sendText(sock, jid, '🔢 Ingresa el *N° de factura* exacto:');
      break;
    case 'filter_cli_name':
      await updateSession(jid, { state: 'AWAITING_INVOICE_CLIENT_NAME' });
      await waHelpers.sendText(sock, jid, '👤 Ingresa el *nombre del cliente* (o parte):');
      break;
    case 'filter_cli_ruc':
      await updateSession(jid, { state: 'AWAITING_INVOICE_CLIENT_RUC' });
      await waHelpers.sendText(sock, jid, '🪪 Ingresa el *RUC o cédula* exacta:');
      break;
    case 'filter_fechas':
      await updateSession(jid, { state: 'AWAITING_DATE_START', tempSummaryMode: false });
      await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de inicio* (dd/mm/aaaa):');
      break;
    case 'ventas_menu':
      await updateSession(jid, { state: 'SALES_MENU' });
      await showSalesMenu(sock, jid);
      break;
    default:
      await showDetailFilterMenu(sock, jid);
  }
}

async function handleInvoiceNumberInput(sock, jid, text, session) {
  const num = parseInt(text.trim());
  if (isNaN(num)) {
    await waHelpers.sendText(sock, jid, '⚠️ Ingresa un número de factura válido:');
    return;
  }
  await waHelpers.sendText(sock, jid, '⏳ Buscando factura...');
  const inv = await salesService.getInvoiceById(session.COM_CODIGO, num);
  await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
  if (!inv) {
    await waHelpers.sendText(sock, jid, '❌ Factura no encontrada.');
    await showDetailFilterMenu(sock, jid);
    return;
  }
  await sendInvoiceCard(sock, jid, inv, session);
}

async function handleInvoiceClientNameInput(sock, jid, text, session) {
  if (text.trim().length < 3) {
    await waHelpers.sendText(sock, jid, '⚠️ Ingresa al menos 3 caracteres:');
    return;
  }
  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  const list = await salesService.searchInvoicesByClientName(session.COM_CODIGO, text.trim());
  await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
  if (!list.length) {
    await waHelpers.sendText(sock, jid, '❌ No se encontraron facturas para ese cliente.');
    await showDetailFilterMenu(sock, jid);
    return;
  }
  if (list.length === 1) {
    const inv = await salesService.getInvoiceById(session.COM_CODIGO, list[0].codigo);
    if (inv) { await sendInvoiceCard(sock, jid, inv, session); return; }
  }
  await sendInvoiceList(sock, jid, list);
}

async function handleInvoiceClientRucInput(sock, jid, text, session) {
  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  const list = await salesService.searchInvoicesByClientRuc(session.COM_CODIGO, text.trim());
  await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
  if (!list.length) {
    await waHelpers.sendText(sock, jid, '❌ No se encontraron facturas para ese RUC.');
    await showDetailFilterMenu(sock, jid);
    return;
  }
  if (list.length === 1) {
    const inv = await salesService.getInvoiceById(session.COM_CODIGO, list[0].codigo);
    if (inv) { await sendInvoiceCard(sock, jid, inv, session); return; }
  }
  await sendInvoiceList(sock, jid, list);
}

async function handleDateStartInput(sock, jid, text, session) {
  const date = parseDateStr(text.trim());
  if (!date) {
    await waHelpers.sendText(sock, jid, '⚠️ Formato inválido. Usa *dd/mm/aaaa*:');
    return;
  }
  await updateSession(jid, { state: 'AWAITING_DATE_END', tempDateStart: date.toISOString() });
  await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de fin* (dd/mm/aaaa):');
}

async function handleDateEndInput(sock, jid, text, session) {
  const dateEnd = parseDateStr(text.trim());
  if (!dateEnd) {
    await waHelpers.sendText(sock, jid, '⚠️ Formato inválido. Usa *dd/mm/aaaa*:');
    return;
  }
  const dateStart = new Date(session.tempDateStart);
  if (dateEnd < dateStart) {
    await waHelpers.sendText(sock, jid, '⚠️ La fecha fin debe ser mayor o igual a la fecha inicio:');
    return;
  }
  dateEnd.setHours(23, 59, 59);
  const label = `${fmtDate(dateStart)} al ${fmtDate(dateEnd)}`;

  if (session.tempSummaryMode) {
    await waHelpers.sendText(sock, jid, `⏳ Calculando resumen *${label}*...`);
    const summary = await salesService.getSalesSummary(session.COM_CODIGO, dateStart, dateEnd);
    await updateSession(jid, { state: 'SALES_MENU' });
    await sendSummaryCard(sock, jid, summary, label);
    return;
  }

  await waHelpers.sendText(sock, jid, '⏳ Buscando facturas...');
  const list = await salesService.getRecentInvoices(session.COM_CODIGO, dateStart, dateEnd, 10);
  await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
  if (!list.length) {
    await waHelpers.sendText(sock, jid, '⚠️ No hay facturas en ese rango de fechas.');
    await showDetailFilterMenu(sock, jid);
    return;
  }
  if (list.length === 1) {
    const inv = await salesService.getInvoiceById(session.COM_CODIGO, list[0].codigo);
    if (inv) { await sendInvoiceCard(sock, jid, inv, session); return; }
  }
  await sendInvoiceList(sock, jid, list);
}

async function handleSummaryMenu(sock, jid, text, session) {
  let range;
  switch (text) {
    case 'sum_este_mes':     range = getMonthRange(0);  break;
    case 'sum_mes_anterior': range = getMonthRange(1);  break;
    case 'sum_trimestre':    range = getQuarterRange(); break;
    case 'sum_anio':         range = getYearRange();    break;
    case 'sum_rango':
      await updateSession(jid, { state: 'AWAITING_DATE_START', tempSummaryMode: true });
      await waHelpers.sendText(sock, jid, '📅 Ingresa la *fecha de inicio* del resumen (dd/mm/aaaa):');
      return;
    case 'ventas_menu':
      await updateSession(jid, { state: 'SALES_MENU' });
      await showSalesMenu(sock, jid);
      return;
    default:
      await showSummaryPeriodMenu(sock, jid);
      return;
  }
  await waHelpers.sendText(sock, jid, `⏳ Calculando resumen para *${range.label}*...`);
  const summary = await salesService.getSalesSummary(session.COM_CODIGO, range.start, range.end);
  await updateSession(jid, { state: 'SALES_MENU' });
  await sendSummaryCard(sock, jid, summary, range.label);
}

async function handleInvoiceSelection(sock, jid, text, session) {
  const id = parseInt(text.replace('inv_sel_', ''));
  if (isNaN(id)) return;
  await waHelpers.sendText(sock, jid, '⏳ Cargando factura...');
  const inv = await salesService.getInvoiceById(session.COM_CODIGO, id);
  if (!inv) { await waHelpers.sendText(sock, jid, '❌ Factura no encontrada.'); return; }
  await sendInvoiceCard(sock, jid, inv, session);
}

async function sendInvoiceCard(sock, jid, inv, session) {
  await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
  const detalleText = inv.detalles.slice(0, 3).map(d =>
    `• ${d.nombre} x${d.cantidad.toFixed(0)} → ${fmt(d.total)}`
  ).join('\n');
  const body =
    `📅 Fecha: ${fmtDate(inv.fecha)}\n` +
    `👤 ${inv.clienteNombre}\n` +
    `🪪 RUC: ${inv.clienteRuc || '—'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Base IVA 12%: ${fmt(inv.baseIva)}\n` +
    `Base IVA 0%:  ${fmt(inv.baseCero)}\n` +
    `IVA cobrado:  ${fmt(inv.iva)}\n` +
    `*TOTAL: ${fmt(inv.total)}*` +
    (detalleText ? `\n━━━━━━━━━━━━━━━━━━━━\n${detalleText}` : '');

  const buttons = [
    { id: 'filter_numero', text: '🔢 Otra factura' },
    { id: 'volver_menu',   text: '← Menú principal' }
  ];
  if (inv.clienteCodigo) {
    buttons.unshift({ id: `cli_sel_${inv.clienteCodigo}`, text: '👤 Ver ficha cliente' });
  }

  await waHelpers.sendButtons(sock, jid, `🧾 Factura #${inv.codigo}`, body, buttons);
}

async function sendInvoiceList(sock, jid, list) {
  const rows = list.map(f => ({
    id:          `inv_sel_${f.codigo}`,
    title:       `#${f.codigo} — ${fmt(f.total)}`,
    description: `${fmtDate(f.fecha)} · ${f.clienteNombre}`
  }));
  await waHelpers.sendListMessage(sock, jid,
    'FACTURAS ENCONTRADAS',
    `*${list.length}* facturas encontradas. Selecciona una:`,
    'Ver facturas',
    [{ title: 'Facturas', rows }]
  );
}

async function sendSummaryCard(sock, jid, summary, label) {
  const body =
    `📁 Facturas emitidas: *${summary.totalFacturas}*\n` +
    `💰 Total facturado:   *${fmt(summary.totalFacturado)}*\n` +
    `📊 Promedio/factura:  ${fmt(summary.promedio)}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Base gravada 12%: ${fmt(summary.baseIva)}\n` +
    `Base exenta 0%:   ${fmt(summary.baseCero)}\n` +
    `IVA cobrado:      ${fmt(summary.ivaCobrado)}`;

  await waHelpers.sendButtons(sock, jid,
    `📈 RESUMEN — ${label}`,
    body,
    [
      { id: 'ventas_detallado', text: '🧾 Ver facturas' },
      { id: 'ventas_resumen',   text: '📊 Otro período' },
      { id: 'volver_menu',      text: '← Menú principal' }
    ]
  );
}

module.exports = {
  handleSalesMenu, handleDetailFilter,
  handleInvoiceNumberInput, handleInvoiceClientNameInput, handleInvoiceClientRucInput,
  handleDateStartInput, handleDateEndInput,
  handleSummaryMenu, handleInvoiceSelection,
  sendInvoiceCard, sendInvoiceList, sendSummaryCard,
  showDetailFilterMenu, showSummaryPeriodMenu
};
