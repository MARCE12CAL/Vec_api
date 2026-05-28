require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.AMELIA_API_URL;
const AUTH = {
  username: process.env.AMELIA_API_USER,
  password: process.env.AMELIA_API_PASSWORD
};

function toApiDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function get(path, params) {
  const { data } = await axios.get(`${BASE_URL}${path}`, { auth: AUTH, params });
  return data;
}

async function getResumen(comCodigo, startDate, endDate) {
  return get('/api/facturaVentas/bot/resumen', {
    COM_CODIGO:  comCodigo,
    fechaInicio: toApiDate(startDate),
    fechaFinal:  toApiDate(endDate)
  });
}

async function getDetalle(comCodigo, startDate, endDate) {
  return get('/api/facturaVentas/bot/detalle', {
    COM_CODIGO:  comCodigo,
    fechaInicio: toApiDate(startDate),
    fechaFinal:  toApiDate(endDate)
  });
}

async function getClientes(comCodigo, startDate, endDate) {
  return get('/api/facturaVentas/bot/clientes', {
    COM_CODIGO:  comCodigo,
    fechaInicio: toApiDate(startDate),
    fechaFinal:  toApiDate(endDate)
  });
}

async function getArticulos(comCodigo, startDate, endDate, orden = 'total') {
  return get('/api/facturaVentas/bot/articulos', {
    COM_CODIGO:  comCodigo,
    fechaInicio: toApiDate(startDate),
    fechaFinal:  toApiDate(endDate),
    orden
  });
}

async function getEmpresa(ruc) {
  return get('/api/companias/bot/empresa', { ruc });
}

async function getCliente(comCodigo, rucCliente) {
  return get('/api/facturaVentas/bot/cliente', {
    COM_CODIGO: comCodigo,
    rucCliente
  });
}

async function getArticulo(comCodigo, startDate, endDate, texto) {
  return get('/api/facturaVentas/bot/articulo', {
    COM_CODIGO:  comCodigo,
    fechaInicio: toApiDate(startDate),
    fechaFinal:  toApiDate(endDate),
    texto
  });
}

async function getExcelResumen(comCodigo, startDate, endDate) {
  const { data } = await axios.get(`${BASE_URL}/api/facturaVentas/bot/reportes/excel/resumen`, {
    auth: AUTH,
    params: { COM_CODIGO: comCodigo, fechaInicio: toApiDate(startDate), fechaFinal: toApiDate(endDate) },
    responseType: 'arraybuffer'
  });
  return Buffer.from(data);
}

module.exports = { getResumen, getDetalle, getClientes, getArticulos, getEmpresa, getCliente, getArticulo, getExcelResumen };
