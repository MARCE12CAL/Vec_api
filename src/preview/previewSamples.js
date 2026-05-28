/**
 * Datos de ejemplo alineados con el seeder demo (EMPRESA ABC S.A., Mayo 2025).
 * Usados solo en vista previa — no se envían por WhatsApp.
 */

const summaryMayo2025 = {
  totalFacturas: 45,
  totalFacturado: 28900,
  baseIva: 20000,
  baseCero: 8900,
  ivaCobrado: 2400,
  promedio: 642.22,
};

const invoiceList = [
  { codigo: 12, fecha: new Date(2025, 4, 15), clienteNombre: 'FARMACIA ABC', total: 890.5 },
  { codigo: 11, fecha: new Date(2025, 4, 10), clienteNombre: 'FARMACIA ABC', total: 720 },
  { codigo: 8, fecha: new Date(2025, 4, 8), clienteNombre: 'DISTRIBUIDORA XYZ', total: 1250 },
  { codigo: 5, fecha: new Date(2025, 4, 3), clienteNombre: 'COMERCIAL NORTE', total: 680 },
];

const invoiceDetail = {
  codigo: 12,
  fecha: new Date(2025, 4, 15),
  clienteCodigo: 1,
  clienteNombre: 'FARMACIA ABC',
  clienteRuc: '1791234567001',
  baseIva: 615.62,
  baseCero: 178.93,
  iva: 73.87,
  total: 890.5,
  detalles: [
    { nombre: 'PARACETAMOL 500MG', codigo: 'MED001', cantidad: 24, total: 480 },
    { nombre: 'IBUPROFENO 400MG', codigo: 'MED018', cantidad: 12, total: 410.5 },
  ],
};

const topClients = [
  { clienteCodigo: 1, nombre: 'FARMACIA ABC', totalFacturado: 12450, facturasCount: 18 },
  { clienteCodigo: 2, nombre: 'DISTRIBUIDORA XYZ', totalFacturado: 8200, facturasCount: 11 },
  { clienteCodigo: 3, nombre: 'COMERCIAL NORTE', totalFacturado: 5100, facturasCount: 7 },
  { clienteCodigo: 4, nombre: 'CONSUMIDOR FINAL', totalFacturado: 3150, facturasCount: 9 },
];

const clientFarmacia = {
  codigo: 1,
  nombre: 'FARMACIA ABC',
  ruc: '1791234567001',
};

const clientSummary = {
  totalFacturas: 18,
  totalComprado: 12450,
  ultimaFecha: new Date(2025, 4, 15),
};

const clientInvoices = [
  { codigo: 12, fecha: new Date(2025, 4, 15), total: 890.5 },
  { codigo: 11, fecha: new Date(2025, 4, 10), total: 720 },
  { codigo: 9, fecha: new Date(2025, 4, 5), total: 650 },
];

const clientSearchResults = [
  { codigo: 1, nombre: 'FARMACIA ABC', ruc: '1791234567001' },
  { codigo: 2, nombre: 'FARMACIA DEL SUR', ruc: '1799876543001' },
];

const topArticlesUnidades = [
  { artCodigo: 1, nombre: 'PARACETAMOL 500MG', unidades: 420, total: 8400 },
  { artCodigo: 2, nombre: 'AMOXICILINA 500MG', unidades: 310, total: 6200 },
  { artCodigo: 3, nombre: 'IBUPROFENO 400MG', unidades: 285, total: 5700 },
];

const topArticlesMonto = [
  { artCodigo: 1, nombre: 'PARACETAMOL 500MG', unidades: 420, total: 8400 },
  { artCodigo: 2, nombre: 'AMOXICILINA 500MG', unidades: 310, total: 6200 },
  { artCodigo: 3, nombre: 'IBUPROFENO 400MG', unidades: 285, total: 5700 },
];

const articleParacetamol = {
  codigo: 1,
  nombre: 'PARACETAMOL 500MG',
  codPpal: 'MED001',
  grupo: 'Medicamentos',
};

const articleSearchResults = [
  { codigo: 1, nombre: 'PARACETAMOL 500MG', codPpal: 'MED001', grupo: 'Medicamentos' },
  { codigo: 3, nombre: 'PARACETAMOL GOTAS', codPpal: 'MED099', grupo: 'Medicamentos' },
];

const articleSalesText =
  '📈 *VENTAS RECIENTES*\n' +
  '━━━━━━━━━━━━━━━━━━━━\n' +
  '1. 15/05/2025 — FARMACIA ABC\n' +
  '   Cant: 24 · Total: $480.00\n' +
  '2. 10/05/2025 — DISTRIBUIDORA XYZ\n' +
  '   Cant: 18 · Total: $360.00\n' +
  '3. 05/05/2025 — COMERCIAL NORTE\n' +
  '   Cant: 12 · Total: $240.00';

module.exports = {
  empresaNombre: 'EMPRESA ABC S.A.',
  summaryMayo2025,
  summaryLabels: {
    esteMes: 'Mayo 2026',
    mesAnterior: 'Abril 2026',
    trimestre: 'Q2 2026',
    anio: 'Año 2026',
    rango: '01/05/2025 — 31/05/2025',
  },
  invoiceList,
  invoiceDetail,
  topClients,
  clientFarmacia,
  clientSummary,
  clientInvoices,
  clientSearchResults,
  topArticlesUnidades,
  topArticlesMonto,
  articleParacetamol,
  articleSearchResults,
  articleSalesText,
};
