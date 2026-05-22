const clientsService = require('../services/clientsService');
const { updateSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const { showClientsMenu, showMainMenu } = require('./menuHandler');
const { getMonthRange, fmt, fmtDate } = require('../utils/dateHelpers');

async function showSearchCriteriaMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'BUSCAR CLIENTE',
    '¿Cómo deseas buscar?',
    'Seleccionar criterio',
    [
      {
        title: 'Criterio de búsqueda',
        rows: [
          { id: 'buscar_cli_nombre', title: '👤 Por nombre o razón social', description: 'Búsqueda parcial por texto' },
          { id: 'buscar_cli_ruc',    title: '🪪 Por RUC o cédula exacta',   description: 'Identificación tributaria' }
        ]
      },
      {
        title: 'Volver',
        rows: [{ id: 'clientes_menu', title: '← Clientes', description: '' }]
      }
    ]
  );
}

async function handleClientsMenu(sock, jid, text, session) {
  switch (text) {
    case 'clientes_top': {
      await waHelpers.sendText(sock, jid, '⏳ Consultando top clientes del mes...');
      const { start, end, label } = getMonthRange(0);
      const list = await clientsService.getTopClientsByAmount(session.COM_CODIGO, start, end, 10);
      await updateSession(jid, { state: 'CLIENTS_MENU' });
      if (!list.length) {
        await waHelpers.sendText(sock, jid, '⚠️ No hay datos de ventas para este mes.');
        await showClientsMenu(sock, jid);
        return;
      }
      await sendTopClientsList(sock, jid, list, label);
      break;
    }

    case 'clientes_buscar':
      await updateSession(jid, { state: 'CLIENTS_SEARCH_CRITERIA' });
      await showSearchCriteriaMenu(sock, jid);
      break;

    case 'volver_menu':
      await updateSession(jid, { state: 'MAIN_MENU' });
      await showMainMenu(sock, jid, session.COM_CODIGO);
      break;

    default:
      await showClientsMenu(sock, jid);
  }
}

async function handleSearchCriteria(sock, jid, text, session) {
  switch (text) {
    case 'buscar_cli_nombre':
      await updateSession(jid, { state: 'AWAITING_CLIENT_NAME' });
      await waHelpers.sendText(sock, jid, '👤 Ingresa el *nombre o razón social* (o parte):');
      break;

    case 'buscar_cli_ruc':
      await updateSession(jid, { state: 'AWAITING_CLIENT_RUC' });
      await waHelpers.sendText(sock, jid, '🪪 Ingresa el *RUC o cédula* exacta:');
      break;

    case 'clientes_menu':
      await updateSession(jid, { state: 'CLIENTS_MENU' });
      await showClientsMenu(sock, jid);
      break;

    default:
      await showSearchCriteriaMenu(sock, jid);
  }
}

async function handleClientNameInput(sock, jid, text, session) {
  if (text.trim().length < 3) {
    await waHelpers.sendText(sock, jid, '⚠️ Ingresa al menos 3 caracteres:');
    return;
  }
  await waHelpers.sendText(sock, jid, '⏳ Buscando clientes...');
  const list = await clientsService.searchClientByName(session.COM_CODIGO, text.trim());
  if (!list.length) {
    await waHelpers.sendText(sock, jid, '❌ No se encontraron clientes con ese nombre.');
    await showSearchCriteriaMenu(sock, jid);
    return;
  }
  if (list.length === 1) {
    await showClientCard(sock, jid, list[0], session);
    return;
  }
  await updateSession(jid, { state: 'CLIENTS_SEARCH_CRITERIA' });
  const rows = list.map(c => ({ id: `cli_sel_${c.codigo}`, title: c.nombre, description: `RUC: ${c.ruc}` }));
  await waHelpers.sendListMessage(sock, jid,
    'RESULTADOS',
    `*${list.length}* clientes encontrados. Selecciona uno:`,
    'Ver cliente',
    [{ title: 'Clientes', rows }]
  );
}

async function handleClientRucInput(sock, jid, text, session) {
  await waHelpers.sendText(sock, jid, '⏳ Buscando cliente...');
  const c = await clientsService.searchClientByRuc(session.COM_CODIGO, text.trim());
  if (!c) {
    await waHelpers.sendText(sock, jid, '❌ RUC no encontrado.');
    await showSearchCriteriaMenu(sock, jid);
    return;
  }
  await showClientCard(sock, jid, c, session);
}

async function handleClientSelection(sock, jid, text, session) {
  const id = parseInt(text.replace('cli_sel_', '').replace('cli_ficha_', ''));
  if (isNaN(id)) return;
  const c = await clientsService.getClientById(session.COM_CODIGO, id);
  if (!c) { await waHelpers.sendText(sock, jid, '❌ Cliente no encontrado.'); return; }
  await showClientCard(sock, jid, c, session);
}

async function showClientCard(sock, jid, c, session) {
  const summary = await clientsService.getClientSummary(session.COM_CODIGO, c.codigo);
  await updateSession(jid, { state: 'CLIENT_DETAIL', tempCliCodigo: c.codigo });

  const body = `🪪 RUC: ${c.ruc}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 Total facturas: *${summary.totalFacturas}*\n` +
    `💰 Total comprado: *${fmt(summary.totalComprado)}*\n` +
    `📅 Última compra:  ${fmtDate(summary.ultimaFecha) || '—'}`;

  await waHelpers.sendButtons(sock, jid,
    `👤 ${c.nombre}`,
    body,
    [
      { id: `cli_hist_${c.codigo}`,  text: '🧾 Historial de facturas' },
      { id: 'clientes_buscar',       text: '🔍 Buscar otro cliente' },
      { id: 'volver_menu',           text: '← Menú principal' }
    ]
  );
}

async function handleClientDetail(sock, jid, text, session) {
  if (text.startsWith('cli_hist_')) {
    const id = parseInt(text.replace('cli_hist_', ''));
    await waHelpers.sendText(sock, jid, '⏳ Cargando historial...');
    const invoices = await clientsService.getClientInvoices(session.COM_CODIGO, id, 8);
    await updateSession(jid, { state: 'CLIENTS_MENU' });
    if (!invoices.length) {
      await waHelpers.sendText(sock, jid, '⚠️ No se encontraron facturas para este cliente.');
      await showClientsMenu(sock, jid);
      return;
    }
    const rows = invoices.map(f => ({
      id:          `inv_cli_${f.codigo}`,
      title:       `#${f.codigo} — ${fmt(f.total)}`,
      description: fmtDate(f.fecha)
    }));
    await waHelpers.sendListMessage(sock, jid,
      'HISTORIAL DE FACTURAS',
      `Últimas *${invoices.length}* facturas del cliente:`,
      'Ver facturas',
      [{ title: 'Facturas', rows }]
    );
    return;
  }

  if (text === 'clientes_buscar') {
    await updateSession(jid, { state: 'CLIENTS_SEARCH_CRITERIA' });
    await showSearchCriteriaMenu(sock, jid);
    return;
  }

  if (text === 'volver_menu') {
    await updateSession(jid, { state: 'MAIN_MENU' });
    await showMainMenu(sock, jid, session.COM_CODIGO);
    return;
  }

  // Tap en factura del historial → navegar a ventas
  if (text.startsWith('cli_ficha_')) {
    await handleClientSelection(sock, jid, text, session);
    return;
  }
}

async function sendTopClientsList(sock, jid, list, label) {
  const rows = list.map((c, i) => ({
    id:          `cli_sel_${c.clienteCodigo}`,
    title:       `#${i + 1} ${c.nombre}`,
    description: `${fmt(c.totalFacturado)} · ${c.facturasCount} facturas`
  }));
  await waHelpers.sendListMessage(sock, jid,
    `TOP 10 CLIENTES — ${label}`,
    'Por monto facturado. Toca para ver ficha:',
    'Ver ranking',
    [{ title: 'Clientes', rows }]
  );
}

module.exports = {
  handleClientsMenu, handleSearchCriteria,
  handleClientNameInput, handleClientRucInput,
  handleClientSelection, handleClientDetail
};
