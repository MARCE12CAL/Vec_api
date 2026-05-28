const { sourceDb: db } = require('../sourceDatabase');
const { Op } = require('sequelize');
const ameliaApi = require('./ameliaApi');

async function getTopClientsByAmount(companyCode, startDate, endDate, limit = 10) {
  const rows = await ameliaApi.getClientes(companyCode, startDate, endDate);
  const list = Array.isArray(rows) ? rows : (rows.data || rows.clientes || []);
  return list.slice(0, limit).map(r => ({
    clienteCodigo:  r.clienteCodigo  || r.CLI_CODIGO     || null,
    nombre:         r.nombre         || r.clienteNombre  || 'Desconocido',
    ruc:            r.ruc            || r.clienteRuc     || '',
    totalFacturado: parseFloat(r.totalFacturado || 0),
    facturasCount:  parseInt(r.totalFacturas    || r.facturasCount || 0)
  }));
}

async function searchClientByName(companyCode, name, limit = 5) {
  const rows = await db.Cliente.findAll({
    where: { COM_CODIGO: companyCode, CLI_NOMBRE: { [Op.like]: `%${name}%` } }, limit
  });
  return rows.map(c => ({ codigo: c.CLI_CODIGO, nombre: c.CLI_NOMBRE, ruc: c.CLI_RUCIDE }));
}

async function searchClientByRuc(companyCode, ruc) {
  const r = await ameliaApi.getCliente(companyCode, ruc);
  if (!r) return null;
  const obj = Array.isArray(r) ? r[0] : r;
  if (!obj) return null;
  return {
    codigo: obj.clienteCodigo || obj.CLI_CODIGO  || null,
    nombre: obj.nombre        || obj.clienteNombre || obj.CLI_NOMBRE || '',
    ruc:    obj.ruc           || obj.clienteRuc  || obj.CLI_RUCIDE  || ruc
  };
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
