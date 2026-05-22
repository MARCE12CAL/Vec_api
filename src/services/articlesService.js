const { sourceDb: db } = require('../sourceDatabase');
const { Op } = require('sequelize');

async function _topArticlesQuery(companyCode, orderByAmount, limit) {
  const orderCol = orderByAmount ? 't' : 'u';
  // Subconsulta sobre los últimos 3000 registros usando el PK (índice, respuesta rápida)
  const sql = `
    SELECT ART_CODIGO,
           SUM(DETFAC_CANTIDAD) AS u,
           SUM(DETFAC_TOTAL)    AS t
    FROM (
      SELECT ART_CODIGO, DETFAC_CANTIDAD, DETFAC_TOTAL
      FROM ven_detfac
      WHERE COM_CODIGO = ?
      ORDER BY DETFAC_CODIGO DESC
      LIMIT 3000
    ) sub
    GROUP BY ART_CODIGO
    ORDER BY ${orderCol} DESC
    LIMIT ?
  `;
  const [rows] = await db.sequelize.query(sql, {
    replacements: [companyCode, limit]
  });
  if (!rows.length) return [];

  const artIds   = rows.map(r => r.ART_CODIGO);
  const articles = await db.Articulo.findAll({
    where:   { ART_CODIGO: { [Op.in]: artIds } },
    include: [{ model: db.Grupo, as: 'Grupo', attributes: ['GRUP_NOMBRE'] }]
  });
  const aMap = new Map(articles.map(a => [a.ART_CODIGO, a]));

  return rows.map(r => {
    const a = aMap.get(r.ART_CODIGO);
    return {
      artCodigo: r.ART_CODIGO,
      nombre:    a ? a.ART_NOMBRE          : 'Desconocido',
      codigo:    a ? a.ART_CODIGOPRINCIPAL : '',
      grupo:     (a && a.Grupo) ? a.Grupo.GRUP_NOMBRE : 'General',
      unidades:  parseFloat(r.u || 0),
      total:     parseFloat(r.t || 0)
    };
  });
}

async function getTopArticlesByUnits(companyCode, _start, _end, limit = 10) {
  return _topArticlesQuery(companyCode, false, limit);
}

async function getTopArticlesByAmount(companyCode, _start, _end, limit = 10) {
  return _topArticlesQuery(companyCode, true, limit);
}

async function searchArticleByName(companyCode, searchString, limit = 6) {
  const rows = await db.Articulo.findAll({
    where: { COM_CODIGO: companyCode, ART_NOMBRE: { [Op.like]: `%${searchString}%` } },
    include: [{ model: db.Grupo, as: 'Grupo', attributes: ['GRUP_NOMBRE'] }],
    limit
  });
  return rows.map(a => ({
    codigo:   a.ART_CODIGO,
    nombre:   a.ART_NOMBRE,
    codPpal:  a.ART_CODIGOPRINCIPAL,
    grupo:    a.Grupo ? a.Grupo.GRUP_NOMBRE : 'General'
  }));
}

async function searchArticleByCode(companyCode, code) {
  const a = await db.Articulo.findOne({
    where: { COM_CODIGO: companyCode, ART_CODIGOPRINCIPAL: code },
    include: [{ model: db.Grupo, as: 'Grupo', attributes: ['GRUP_NOMBRE'] }]
  });
  if (!a) return null;
  return { codigo: a.ART_CODIGO, nombre: a.ART_NOMBRE, codPpal: a.ART_CODIGOPRINCIPAL, grupo: a.Grupo ? a.Grupo.GRUP_NOMBRE : 'General' };
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
