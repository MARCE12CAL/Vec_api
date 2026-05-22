const { getSession, resetSession, updateSession } = require('../sessionManager');
const authHandler = require('./authHandler');
const menuHandler = require('./menuHandler');
const salesHandler = require('./salesHandler');
const clientsHandler = require('./clientsHandler');
const articlesHandler = require('./articlesHandler');
const { resolveShortcut } = require('../utils/waHelpers');
const waHelpers = require('../utils/waHelpers');

async function routeMessage(sock, jid, messageText) {
  // Resuelve "1", "2", "3" al ID real del último menú enviado a este JID
  const text = resolveShortcut(jid, messageText.trim());
  const session = await getSession(jid);

  if (text.toLowerCase() === 'salir' || text.toLowerCase() === 'logout') {
    await resetSession(jid);
    await waHelpers.sendText(sock, jid, '🚪 Sesión cerrada. Envía cualquier mensaje para volver a ingresar.');
    return;
  }

  const authenticated = !['WELCOME', 'AWAITING_RUC', 'AWAITING_PASSWORD'].includes(session.state);
  if (authenticated && ['volver', 'cancelar', 'atras', 'volver_menu'].includes(text.toLowerCase())) {
    await updateSession(jid, { state: 'MAIN_MENU' });
    await menuHandler.showMainMenu(sock, jid, session.COM_CODIGO);
    return;
  }

  switch (session.state) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    case 'WELCOME':
      await authHandler.handleWelcome(sock, jid, text, session);
      break;
    case 'AWAITING_RUC':
      await authHandler.handleRuc(sock, jid, text, session);
      break;
    case 'AWAITING_PASSWORD':
      await authHandler.handlePassword(sock, jid, text, session);
      break;

    // ── Main menu ─────────────────────────────────────────────────────────────
    case 'MAIN_MENU':
      await menuHandler.handleMenu(sock, jid, text, session);
      break;

    // ── Sales ─────────────────────────────────────────────────────────────────
    case 'SALES_MENU':
      await salesHandler.handleSalesMenu(sock, jid, text, session);
      break;
    case 'SALES_DETAIL_FILTER':
      await salesHandler.handleDetailFilter(sock, jid, text, session);
      break;
    case 'AWAITING_INVOICE_NUMBER':
      await salesHandler.handleInvoiceNumberInput(sock, jid, text, session);
      break;
    case 'AWAITING_INVOICE_CLIENT_NAME':
      await salesHandler.handleInvoiceClientNameInput(sock, jid, text, session);
      break;
    case 'AWAITING_INVOICE_CLIENT_RUC':
      await salesHandler.handleInvoiceClientRucInput(sock, jid, text, session);
      break;
    case 'AWAITING_DATE_START':
      await salesHandler.handleDateStartInput(sock, jid, text, session);
      break;
    case 'AWAITING_DATE_END':
      await salesHandler.handleDateEndInput(sock, jid, text, session);
      break;
    case 'SALES_SUMMARY_MENU':
      await salesHandler.handleSummaryMenu(sock, jid, text, session);
      break;

    // ── Clients ───────────────────────────────────────────────────────────────
    case 'CLIENTS_MENU':
      if (text.startsWith('inv_cli_')) {
        const invId = text.replace('inv_cli_', '');
        await updateSession(jid, { state: 'SALES_DETAIL_FILTER' });
        await salesHandler.handleInvoiceSelection(sock, jid, `inv_sel_${invId}`, session);
      } else if (text.startsWith('cli_sel_')) {
        await updateSession(jid, { state: 'CLIENT_DETAIL' });
        await clientsHandler.handleClientSelection(sock, jid, text, session);
      } else {
        await clientsHandler.handleClientsMenu(sock, jid, text, session);
      }
      break;
    case 'CLIENTS_SEARCH_CRITERIA':
      await clientsHandler.handleSearchCriteria(sock, jid, text, session);
      break;
    case 'AWAITING_CLIENT_NAME':
      await clientsHandler.handleClientNameInput(sock, jid, text, session);
      break;
    case 'AWAITING_CLIENT_RUC':
      await clientsHandler.handleClientRucInput(sock, jid, text, session);
      break;
    case 'CLIENT_DETAIL':
      await clientsHandler.handleClientDetail(sock, jid, text, session);
      break;

    // ── Articles ──────────────────────────────────────────────────────────────
    case 'ARTICLES_MENU':
      if (text.startsWith('art_sel_')) {
        await updateSession(jid, { state: 'ARTICLE_DETAIL' });
        await articlesHandler.handleArticleSelection(sock, jid, text, session);
      } else {
        await articlesHandler.handleArticlesMenu(sock, jid, text, session);
      }
      break;
    case 'AWAITING_ARTICLE_NAME':
      await articlesHandler.handleArticleNameInput(sock, jid, text, session);
      break;
    case 'AWAITING_ARTICLE_CODE':
      await articlesHandler.handleArticleCodeInput(sock, jid, text, session);
      break;
    case 'ARTICLE_DETAIL':
      await articlesHandler.handleArticleDetail(sock, jid, text, session);
      break;

    default:
      await resetSession(jid);
      await authHandler.showWelcome(sock, jid);
      break;
  }
}

module.exports = { routeMessage };
