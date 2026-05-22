const { sourceDb: db } = require('../sourceDatabase');
const { Op } = require('sequelize');

async function getTopClientsByAmount(companyCode, startDate, endDate, limit = 10) {
  const rows = await db.FacturaEnc.findAll({
    attributes: [
      'CLI_CODIGO',
      [db.Sequelize.fn('SUM',   db.Sequelize.col('ENCFAC_TOTAL')),  'totalFacturado'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('ENCFAC_CODIGO')), 'facturasCount']
    ],
    where: { COM_CODIGO: companyCode, ENCFAC_FECHAEMISION: { [Op.between]: [startDate, endDate] } },
    group: ['CLI_CODIGO'],
    order: [[db.Sequelize.literal('totalFacturado'), 'DESC']],
    limit, raw: true
  });
  if (!rows.length) return [];

  const codes = rows.map(r => r.CLI_CODIGO);
  const clients = await db.Cliente.findAll({
    where: { COM_CODIGO: companyCode, CLI_CODIGO: { [Op.in]: codes } }, raw: true
  });
  const cMap = new Map(clients.map(c => [c.CLI_CODIGO, c]));

  return rows.map(r => {
    const c = cMap.get(r.CLI_CODIGO) || {};
    return {
      clienteCodigo:  r.CLI_CODIGO,
      nombre:         c.CLI_NOMBRE || 'Desconocido',
      ruc:            c.CLI_RUCIDE || '',
      totalFacturado: parseFloat(r.totalFacturado || 0),
      facturasCount:  parseInt(r.facturasCount    || 0)
    };
  });
}

async function searchClientByName(companyCode, name, limit = 5) {
  const rows = await db.Cliente.findAll({
    where: { COM_CODIGO: companyCode, CLI_NOMBRE: { [Op.like]: `%${name}%` } }, limit
  });
  return rows.map(c => ({ codigo: c.CLI_CODIGO, nombre: c.CLI_NOMBRE, ruc: c.CLI_RUCIDE }));
}

async function searchClientByRuc(companyCode, ruc) {
  const c = await db.Cliente.findOne({ where: { COM_CODIGO: companyCode, CLI_RUCIDE: ruc } });
  if (!c) return null;
  return { codigo: c.CLI_CODIGO, nombre: c.CLI_NOMBRE, ruc: c.CLI_RUCIDE };
}

async function getClientById(companyCode, clientCodigo) {
  const c = await db.Cliente.findOne({ where: { COM_CODIGO: companyCode, CLI_CODIGO: clientCodigo } });
  if (!c) return null;
  return { codigo: c.CLI_CODIGO, nombre: c.CLI_NOMBRE, ruc: c.CLI_RUCIDE };
}

async function getClientInvoices(companyCode, clientCodigo, limit = 10) {
  const rows = await db.FacturaEnc.findAll({
    where: { COM_CODIGO: companyCode, CLI_CODIGO: clientCodigo },
    order: [['ENCFAC_FECHAEMISION', 'DESC']], limit
  });
  return rows.map(f => ({
    codigo: f.ENCFAC_CODIGO,
    fecha:  f.ENCFAC_FECHAEMISION,
    total:  parseFloat(f.ENCFAC_TOTAL)
  }));
}

async function getClientSummary(companyCode, clientCodigo) {
  const r = await db.FacturaEnc.findOne({
    attributes: [
      [db.Sequelize.fn('COUNT', db.Sequelize.col('ENCFAC_CODIGO')), 'count'],
      [db.Sequelize.fn('SUM',   db.Sequelize.col('ENCFAC_TOTAL')),  'total'],
      [db.Sequelize.fn('MAX',   db.Sequelize.col('ENCFAC_FECHAEMISION')), 'ultimaFecha']
    ],
    where: { COM_CODIGO: companyCode, CLI_CODIGO: clientCodigo },
    raw: true
  });
  return {
    totalFacturas: parseInt(r.count || 0),
    totalComprado: parseFloat(r.total || 0),
    ultimaFecha:   r.ultimaFecha
  };
}

module.exports = { getTopClientsByAmount, searchClientByName, searchClientByRuc, getClientById, getClientInvoices, getClientSummary };
