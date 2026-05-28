const { updateSession, resetSession } = require('../sessionManager');
const waHelpers = require('../utils/waHelpers');
const IC = require('../utils/icons');

async function showMainMenu(sock, jid, comCodigo, companyName = 'Empresa') {
  await waHelpers.sendListMessage(sock, jid,
    companyName,
    '¿Qué deseas consultar?',
    'Ver opciones',
    [
      {
        title: 'Módulos',
        rows: [
          { id: 'ventas',    title: `${IC.SALES} Ventas`,    description: 'Facturas y resumen mensual' },
          { id: 'clientes',  title: `${IC.CLIENTS} Clientes`,  description: 'Top 10 · Buscar · Historial' },
          { id: 'articulos', title: `${IC.BOX} Artículos`, description: 'Más vendidos · Buscar' }
        ]
      },
      {
        title: 'Sesión',
        rows: [{ id: 'logout', title: `${IC.LOGOUT} Cerrar sesión`, description: '' }]
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
    case 'ventas_excel':
      await updateSession(jid, { state: 'SALES_EXCEL_MENU' });
      await showExcelPeriodMenu(sock, jid);
      break;
    case 'logout':
      await resetSession(jid);
      await waHelpers.sendText(sock, jid, `${IC.LOGOUT} Sesión cerrada. Envía cualquier mensaje para volver a ingresar.`);
      break;
    default:
      await showMainMenu(sock, jid, session.COM_CODIGO, session.COM_NOMBRE);
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
          { id: 'ventas_detallado', title: `${IC.RECEIPT} Detallado por factura`, description: 'Buscar por fecha, cliente o N° de factura' },
          { id: 'ventas_resumen',   title: `${IC.SALES} Resumen mensual`,         description: 'Totales, IVA y comprobantes por período' },
          { id: 'ventas_excel',     title: `${IC.DOWNLOAD} Descargar Excel`,      description: 'Resumen de ventas en archivo .xlsx' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: `${IC.BACK} Menú principal`, description: '' }]
      }
    ]
  );
}

async function showExcelPeriodMenu(sock, jid) {
  await waHelpers.sendListMessage(sock, jid,
    'EXCEL — PERÍODO',
    '¿Qué período incluir en el reporte?',
    'Seleccionar período',
    [
      {
        title: 'Períodos predefinidos',
        rows: [
          { id: 'excel_este_mes',     title: `${IC.DATE} Este mes`,          description: 'Mes en curso' },
          { id: 'excel_mes_anterior', title: `${IC.DATE} Mes anterior`,      description: 'Período anterior completo' },
          { id: 'excel_trimestre',    title: `${IC.CALENDAR} Último trimestre`, description: 'Últimos 3 meses' },
          { id: 'excel_anio',         title: `${IC.CALENDAR} Este año`,      description: 'Desde enero hasta hoy' }
        ]
      },
      {
        title: 'Personalizado',
        rows: [
          { id: 'excel_rango', title: `${IC.CAL_RANGE} Rango libre`, description: 'Define fechas inicio y fin' },
          { id: 'ventas_menu', title: `${IC.BACK} Ventas`,           description: '' }
        ]
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
          { id: 'clientes_top',    title: `${IC.TROPHY} Top 10 por monto`,  description: 'Los más facturados del mes' },
          { id: 'clientes_buscar', title: `${IC.SEARCH} Buscar cliente`,    description: 'Por nombre o RUC/cédula' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: `${IC.BACK} Menú principal`, description: '' }]
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
          { id: 'art_top_unidades', title: `${IC.TREND} Top 10 por unidades`, description: 'Más vendidos en cantidad' },
          { id: 'art_top_monto',    title: `${IC.MONEY} Top 10 por monto`,    description: 'Más vendidos en valor $' }
        ]
      },
      {
        title: 'Buscar artículo',
        rows: [
          { id: 'art_buscar_nombre', title: `${IC.SEARCH} Buscar por nombre`, description: 'Búsqueda parcial por texto' },
          { id: 'art_buscar_codigo', title: `${IC.TAG} Buscar por código`,    description: 'Código principal exacto' }
        ]
      },
      {
        title: 'Navegación',
        rows: [{ id: 'volver_menu', title: `${IC.BACK} Menú principal`, description: '' }]
      }
    ]
  );
}

module.exports = { showMainMenu, handleMenu, showSalesMenu, showExcelPeriodMenu, showClientsMenu, showArticlesMenu };
