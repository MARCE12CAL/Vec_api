const { updateSession, resetSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const { sourceDb: db } = require('../sourceDatabase');

async function showMainMenu(sock, jid, comCodigo) {
  const company = await db.Compania.findByPk(comCodigo);
  const nombre = company ? company.COM_NOMBRE : 'Empresa';
  await waHelpers.sendListMessage(sock, jid,
    nombre,
    '¿Qué deseas consultar?',
    'Ver opciones',
    [
      {
        title: 'Módulos',
        rows: [
          { id: 'ventas',    title: '📊 Ventas',    description: 'Facturas y resumen mensual' },
          { id: 'clientes',  title: '👥 Clientes',  description: 'Top 10 · Buscar · Historial' },
          { id: 'articulos', title: '📦 Artículos', description: 'Más vendidos · Buscar' }
        ]
      },
      {
        title: 'Sesión',
        rows: [
          { id: 'logout', title: '🚪 Cerrar sesión', description: '' }
        ]
      }
    ]
  );
}

async function handleMenu(sock, jid, text, session) {
  switch (text) {
    case 'ventas':
      await updateSession(jid, { state: 'SALES_MENU' });
      await showSalesMenu(sock, jid);
      break;
    case 'clientes':
      await updateSession(jid, { state: 'CLIENTS_MENU' });
      await showClientsMenu(sock, jid);
      break;
    case 'articulos':
      await updateSession(jid, { state: 'ARTICLES_MENU' });
      await showArticlesMenu(sock, jid);
      break;
    case 'logout':
      await resetSession(jid);
      await waHelpers.sendText(sock, jid, '🚪 Sesión cerrada. Envía cualquier mensaje para volver a ingresar.');
      break;
    default:
      await showMainMenu(sock, jid, session.COM_CODIGO);
  }
}

async function showSalesMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'VENTAS',
    '¿Qué tipo de consulta deseas realizar?',
    'Ver opciones',
    [
      {
        title: 'Consultas',
        rows: [
          { id: 'ventas_detallado', title: '🧾 Detallado por factura', description: 'Buscar por fecha, cliente o N° de factura' },
          { id: 'ventas_resumen',   title: '📊 Resumen mensual',       description: 'Totales, IVA y comprobantes por período' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: '← Menú principal', description: '' }]
      }
    ]
  );
}

async function showClientsMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'CLIENTES',
    '¿Qué deseas consultar?',
    'Ver opciones',
    [
      {
        title: 'Consultas',
        rows: [
          { id: 'clientes_top',    title: '🏆 Top 10 por monto',   description: 'Los más facturados del mes' },
          { id: 'clientes_buscar', title: '🔍 Buscar cliente',      description: 'Por nombre o RUC/cédula' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: '← Menú principal', description: '' }]
      }
    ]
  );
}

async function showArticlesMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'ARTÍCULOS',
    '¿Qué deseas consultar?',
    'Ver opciones',
    [
      {
        title: 'Top vendidos',
        rows: [
          { id: 'art_top_unidades', title: '📈 Top 10 por unidades', description: 'Más vendidos en cantidad' },
          { id: 'art_top_monto',    title: '💰 Top 10 por monto',    description: 'Más vendidos en valor $' }
        ]
      },
      {
        title: 'Buscar artículo',
        rows: [
          { id: 'art_buscar_nombre', title: '🔍 Buscar por nombre',  description: 'Búsqueda parcial por texto' },
          { id: 'art_buscar_codigo', title: '🏷️ Buscar por código',  description: 'Código principal exacto' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: '← Menú principal', description: '' }]
      }
    ]
  );
}

module.exports = { showMainMenu, handleMenu, showSalesMenu, showClientsMenu, showArticlesMenu };
