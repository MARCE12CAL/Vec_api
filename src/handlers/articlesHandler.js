const articlesService = require('../services/articlesService');
const { updateSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const { showArticlesMenu, showMainMenu } = require('./menuHandler');
const { getMonthRange, fmt, fmtDate } = require('../utils/dateHelpers');

async function handleArticlesMenu(sock, jid, text, session) {
  const { start, end, label } = getMonthRange(0);

  switch (text) {
    case 'art_top_unidades': {
      await waHelpers.sendText(sock, jid, '⏳ Consultando top por unidades...');
      const list = await articlesService.getTopArticlesByUnits(session.COM_CODIGO, start, end, 10);
      await updateSession(jid, { state: 'ARTICLES_MENU' });
      if (!list.length) {
        await waHelpers.sendText(sock, jid, '⚠️ No hay datos de ventas para este mes.');
        await showArticlesMenu(sock, jid);
        return;
      }
      await sendTopArticlesList(sock, jid, list, `TOP UNIDADES — ${label}`, 'unidades');
      break;
    }

    case 'art_top_monto': {
      await waHelpers.sendText(sock, jid, '⏳ Consultando top por monto...');
      const list = await articlesService.getTopArticlesByAmount(session.COM_CODIGO, start, end, 10);
      await updateSession(jid, { state: 'ARTICLES_MENU' });
      if (!list.length) {
        await waHelpers.sendText(sock, jid, '⚠️ No hay datos de ventas para este mes.');
        await showArticlesMenu(sock, jid);
        return;
      }
      await sendTopArticlesList(sock, jid, list, `TOP MONTO — ${label}`, 'monto');
      break;
    }

    case 'art_buscar_nombre':
      await updateSession(jid, { state: 'AWAITING_ARTICLE_NAME' });
      await waHelpers.sendText(sock, jid, '🔍 Ingresa el *nombre del artículo* (o parte):');
      break;

    case 'art_buscar_codigo':
      await updateSession(jid, { state: 'AWAITING_ARTICLE_CODE' });
      await waHelpers.sendText(sock, jid, '🏷️ Ingresa el *código principal* exacto:');
      break;

    case 'volver_menu':
      await updateSession(jid, { state: 'MAIN_MENU' });
      await showMainMenu(sock, jid, session.COM_CODIGO);
      break;

    default:
      await showArticlesMenu(sock, jid);
  }
}

async function handleArticleNameInput(sock, jid, text, session) {
  if (text.trim().length < 3) {
    await waHelpers.sendText(sock, jid, '⚠️ Ingresa al menos 3 caracteres:');
    return;
  }
  await waHelpers.sendText(sock, jid, '⏳ Buscando artículos...');
  const list = await articlesService.searchArticleByName(session.COM_CODIGO, text.trim());
  if (!list.length) {
    await waHelpers.sendText(sock, jid, '❌ No se encontraron artículos con ese nombre.');
    await showArticlesMenu(sock, jid);
    return;
  }
  if (list.length === 1) {
    await showArticleCard(sock, jid, list[0], session);
    return;
  }
  await updateSession(jid, { state: 'ARTICLES_MENU' });
  const rows = list.map(a => ({
    id:          `art_sel_${a.codigo}`,
    title:       a.nombre,
    description: `Cód: ${a.codPpal} · ${a.grupo}`
  }));
  await waHelpers.sendListMessage(sock, jid,
    'RESULTADOS',
    `*${list.length}* artículos encontrados. Selecciona uno:`,
    'Ver artículo',
    [{ title: 'Artículos', rows }]
  );
}

async function handleArticleCodeInput(sock, jid, text, session) {
  await waHelpers.sendText(sock, jid, '⏳ Buscando artículo...');
  const a = await articlesService.searchArticleByCode(session.COM_CODIGO, text.trim());
  if (!a) {
    await waHelpers.sendText(sock, jid, '❌ Código no encontrado.');
    await showArticlesMenu(sock, jid);
    return;
  }
  await showArticleCard(sock, jid, a, session);
}

async function handleArticleSelection(sock, jid, text, session) {
  const id = parseInt(text.replace('art_sel_', '').replace('art_det_', ''));
  if (isNaN(id)) return;
  const a = await articlesService.getArticleById(session.COM_CODIGO, id);
  if (!a) { await waHelpers.sendText(sock, jid, '❌ Artículo no encontrado.'); return; }
  await showArticleCard(sock, jid, a, session);
}

async function showArticleCard(sock, jid, a, session) {
  await updateSession(jid, { state: 'ARTICLE_DETAIL', tempArtCodigo: a.codigo });

  const body = `🏷️ Código: *${a.codPpal}*\n` +
    `📂 Grupo: ${a.grupo}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;

  await waHelpers.sendButtons(sock, jid,
    `📦 ${a.nombre}`,
    body,
    [
      { id: `art_ventas_${a.codigo}`, text: '📈 Ver ventas recientes' },
      { id: 'art_buscar_nombre',      text: '🔍 Buscar otro artículo' },
      { id: 'volver_menu',            text: '← Menú principal' }
    ]
  );
}

async function handleArticleDetail(sock, jid, text, session) {
  if (text.startsWith('art_ventas_')) {
    const id = parseInt(text.replace('art_ventas_', ''));
    await waHelpers.sendText(sock, jid, '⏳ Cargando ventas recientes...');
    const ventas = await articlesService.getArticleSales(session.COM_CODIGO, id, 5);
    await updateSession(jid, { state: 'ARTICLES_MENU' });
    if (!ventas.length) {
      await waHelpers.sendText(sock, jid, '⚠️ No se registran ventas recientes para este artículo.');
      await showArticlesMenu(sock, jid);
      return;
    }
    let txt = `📈 *VENTAS RECIENTES*\n━━━━━━━━━━━━━━━━━━━━\n`;
    ventas.forEach((v, i) => {
      txt += `${i + 1}. ${fmtDate(v.fecha)} — ${v.cliente}\n`;
      txt += `   Cant: ${v.cantidad} · Total: ${fmt(v.total)}\n`;
    });
    await waHelpers.sendText(sock, jid, txt.trim());
    await showArticlesMenu(sock, jid);
    return;
  }

  if (text === 'art_buscar_nombre') {
    await updateSession(jid, { state: 'AWAITING_ARTICLE_NAME' });
    await waHelpers.sendText(sock, jid, '🔍 Ingresa el *nombre del artículo* (o parte):');
    return;
  }

  if (text === 'volver_menu') {
    await updateSession(jid, { state: 'MAIN_MENU' });
    await showMainMenu(sock, jid, session.COM_CODIGO);
    return;
  }
}

async function sendTopArticlesList(sock, jid, list, title, type) {
  const rows = list.map((a, i) => ({
    id:          `art_sel_${a.artCodigo}`,
    title:       `#${i + 1} ${a.nombre}`,
    description: type === 'unidades'
      ? `${a.unidades.toFixed(0)} und · ${fmt(a.total)}`
      : `${fmt(a.total)} · ${a.unidades.toFixed(0)} und`
  }));
  await waHelpers.sendListMessage(sock, jid,
    title,
    'Toca un artículo para ver su ficha:',
    'Ver lista',
    [{ title: 'Artículos', rows }]
  );
}

module.exports = {
  handleArticlesMenu, handleArticleNameInput, handleArticleCodeInput,
  handleArticleSelection, handleArticleDetail
};
