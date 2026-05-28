const { sourceDb: db } = require('../sourceDatabase');
const ameliaApi = require('./ameliaApi');

function _mapArticleRow(r) {
  return {
    artCodigo: r.artCodigo  || r.ART_CODIGO  || null,
    nombre:    r.nombre     || r.descripcion || 'Desconocido',
    codigo:    r.codigo     || r.codPpal     || '',
    grupo:     r.grupo      || r.categoria   || 'General',
    unidades:  parseFloat(r.unidades  || r.cantidad || 0),
    total:     parseFloat(r.total     || 0)
  };
}

async function getTopArticlesByUnits(companyCode, startDate, endDate, limit = 10) {
  const rows = await ameliaApi.getArticulos(companyCode, startDate, endDate, 'unidades');
  const list = Array.isArray(rows) ? rows : (rows.data || rows.articulos || []);
  return list.slice(0, limit).map(_mapArticleRow);
}

async function getTopArticlesByAmount(companyCode, startDate, endDate, limit = 10) {
  const rows = await ameliaApi.getArticulos(companyCode, startDate, endDate, 'total');
  const list = Array.isArray(rows) ? rows : (rows.data || rows.articulos || []);
  return list.slice(0, limit).map(_mapArticleRow);
}

function _wideRange() {
  const end = new Date();
  const start = new Date(end.getFullYear() - 3, 0, 1);
  return { start, end };
}

async function searchArticleByName(companyCode, searchString, limit = 6) {
  const { start, end } = _wideRange();
  const rows = await ameliaApi.getArticulo(companyCode, start, end, searchString);
  const list = Array.isArray(rows) ? rows : (rows.data || rows.articulos || []);
  return list.slice(0, limit).map(a => ({
    codigo:  a.artCodigo  || a.ART_CODIGO             || null,
    nombre:  a.nombre     || a.descripcion            || a.ART_NOMBRE || 'N/D',
    codPpal: a.codigo     || a.codPpal                || a.ART_CODIGOPRINCIPAL || '',
    grupo:   a.grupo      || a.categoria              || a.GRUP_NOMBRE || 'General'
  }));
}

async function searchArticleByCode(companyCode, code) {
  const { start, end } = _wideRange();
  const rows = await ameliaApi.getArticulo(companyCode, start, end, code);
  const list = Array.isArray(rows) ? rows : (rows.data || rows.articulos || []);
  if (!list.length) return null;
  const a = list[0];
  return {
    codigo:  a.artCodigo  || a.ART_CODIGO             || null,
    nombre:  a.nombre     || a.descripcion            || a.ART_NOMBRE || 'N/D',
    codPpal: a.codigo     || a.codPpal                || a.ART_CODIGOPRINCIPAL || '',
    grupo:   a.grupo      || a.categoria              || a.GRUP_NOMBRE || 'General'
  };
}

async function getArticleById(companyCode, artCodigo) {
  const a = await db.Articulo.findOne({
    where: { COM_CODIGO: companyCode, ART_CODIGO: artCodigo },
    include: [{ model: db.Grupo, as: 'Grupo', attributes: ['GRUP_NOMBRE'] }]
  });
  if (!a) return null;
  return { codigo: a.ART_CODIGO, nombre: a.ART_NOMBRE, codPpal: a.ART_CODIGOPRINCIPAL, grupo: a.Grupo ? a.Grupo.GRUP_NOMBRE : 'General' };
}

async function getArticleSales(companyCode, artCodigo, limit = 5) {
  const rows = await db.FacturaDet.findAll({
    where: { COM_CODIGO: companyCode, ART_CODIGO: artCodigo },
    include: [{ model: db.FacturaEnc, as: 'Factura', attributes: ['ENCFAC_FECHAEMISION', 'ENCFAC_TOTAL'],
      include: [{ model: db.Cliente, as: 'Cliente', attributes: ['CLI_NOMBRE'] }] }],
    order: [[{ model: db.FacturaEnc, as: 'Factura' }, 'ENCFAC_FECHAEMISION', 'DESC']],
    limit
  });
  return rows.map(d => ({
    fecha:    d.Factura ? d.Factura.ENCFAC_FECHAEMISION : null,
    cliente:  (d.Factura && d.Factura.Cliente) ? d.Factura.Cliente.CLI_NOMBRE : 'N/D',
    cantidad: parseFloat(d.DETFAC_CANTIDAD),
    total:    parseFloat(d.DETFAC_TOTAL)
  }));
}

module.exports = { getTopArticlesByUnits, getTopArticlesByAmount, searchArticleByName, searchArticleByCode, getArticleById, getArticleSales };
