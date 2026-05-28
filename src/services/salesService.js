const { sourceDb: db } = require('../sourceDatabase');
const { Op } = require('sequelize');
const ameliaApi = require('./ameliaApi');


async function getSalesSummary(companyCode, startDate, endDate) {
  const r = await ameliaApi.getResumen(companyCode, startDate, endDate);
  const total = parseFloat(r.totalFacturado || 0);
  const count = parseInt(r.totalFacturas    || 0);
  return {
    totalFacturas:  count,
    totalFacturado: total,
    baseIva:        parseFloat(r.baseIva    || r.base_iva    || 0),
    baseCero:       parseFloat(r.baseCero   || r.base_cero   || 0),
    ivaCobrado:     parseFloat(r.valorIva   || r.ivaCobrado  || 0),
    promedio:       count > 0 ? total / count : 0
  };
}

async function getRecentInvoices(companyCode, startDate, endDate, limit = 10) {
  const rows = await ameliaApi.getDetalle(companyCode, startDate, endDate);
  const list = Array.isArray(rows) ? rows : (rows.data || rows.facturas || rows.detalle || []);
  return list.slice(0, limit).map(f => ({
    codigo:        f.codigo        || f.encfacCodigo  || f.ENCFAC_CODIGO       || null,
    fecha:         f.fecha         || f.fechaEmision  || f.ENCFAC_FECHAEMISION || null,
    clienteNombre: f.clienteNombre || f.cliente       || f.CLI_NOMBRE          || 'Consumidor Final',
    total:         parseFloat(f.total || f.totalFactura || f.ENCFAC_TOTAL || 0)
  }));
}

async function getInvoiceById(companyCode, encfacCodigo) {
  const f = await db.FacturaEnc.findOne({
    where: { COM_CODIGO: companyCode, ENCFAC_CODIGO: encfacCodigo },
    include: [
      { model: db.Cliente, as: 'Cliente', attributes: ['CLI_CODIGO', 'CLI_NOMBRE', 'CLI_RUCIDE'] },
      { model: db.FacturaDet, as: 'Detalles',
        include: [{ model: db.Articulo, as: 'Articulo', attributes: ['ART_NOMBRE', 'ART_CODIGOPRINCIPAL'] }] }
    ]
  });
  if (!f) return null;
  return {
    codigo:        f.ENCFAC_CODIGO,
    fecha:         f.ENCFAC_FECHAEMISION,
    clienteCodigo: f.Cliente ? f.Cliente.CLI_CODIGO : null,
    clienteNombre: f.Cliente ? f.Cliente.CLI_NOMBRE : 'Consumidor Final',
    clienteRuc:    f.Cliente ? f.Cliente.CLI_RUCIDE  : '',
    baseIva:       parseFloat(f.ENCFAC_BASEIVA),
    baseCero:      parseFloat(f.ENCFAC_BASECERO),
    iva:           parseFloat(f.ENCFAC_VALORIVA),
    total:         parseFloat(f.ENCFAC_TOTAL),
    detalles:      (f.Detalles || []).map(d => ({
      nombre:   d.Articulo ? d.Articulo.ART_NOMBRE           : 'N/D',
      codigo:   d.Articulo ? d.Articulo.ART_CODIGOPRINCIPAL  : '',
      cantidad: parseFloat(d.DETFAC_CANTIDAD),
      total:    parseFloat(d.DETFAC_TOTAL)
    }))
  };
}

async function searchInvoicesByClientName(companyCode, name, limit = 8) {
  const clientes = await db.Cliente.findAll({
    where: { COM_CODIGO: companyCode, CLI_NOMBRE: { [Op.like]: `%${name}%` } }, limit: 5
  });
  if (!clientes.length) return [];
  const ids = clientes.map(c => c.CLI_CODIGO);
  const rows = await db.FacturaEnc.findAll({
    where: { COM_CODIGO: companyCode, CLI_CODIGO: { [Op.in]: ids } },
    order: [['ENCFAC_FECHAEMISION', 'DESC']], limit,
    include: [{ model: db.Cliente, as: 'Cliente', attributes: ['CLI_NOMBRE'] }]
  });
  return rows.map(f => ({
    codigo:        f.ENCFAC_CODIGO,
    fecha:         f.ENCFAC_FECHAEMISION,
    clienteNombre: f.Cliente ? f.Cliente.CLI_NOMBRE : '',
    total:         parseFloat(f.ENCFAC_TOTAL)
  }));
}

async function searchInvoicesByClientRuc(companyCode, ruc, limit = 8) {
  const cliente = await db.Cliente.findOne({ where: { COM_CODIGO: companyCode, CLI_RUCIDE: ruc } });
  if (!cliente) return [];
  const rows = await db.FacturaEnc.findAll({
    where: { COM_CODIGO: companyCode, CLI_CODIGO: cliente.CLI_CODIGO },
    order: [['ENCFAC_FECHAEMISION', 'DESC']], limit,
    include: [{ model: db.Cliente, as: 'Cliente', attributes: ['CLI_NOMBRE'] }]
  });
  return rows.map(f => ({
    codigo:        f.ENCFAC_CODIGO,
    fecha:         f.ENCFAC_FECHAEMISION,
    clienteNombre: f.Cliente ? f.Cliente.CLI_NOMBRE : '',
    total:         parseFloat(f.ENCFAC_TOTAL)
  }));
}

async function getExcelResumen(companyCode, startDate, endDate) {
  return ameliaApi.getExcelResumen(companyCode, startDate, endDate);
}

module.exports = { getSalesSummary, getRecentInvoices, getInvoiceById, searchInvoicesByClientName, searchInvoicesByClientRuc, getExcelResumen };
