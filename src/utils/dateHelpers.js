const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getMonthRange(monthsAgo = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return {
    start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0),
    end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  };
}

function getQuarterRange() {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  return {
    start: new Date(now.getFullYear(), q * 3, 1, 0, 0, 0),
    end:   new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59),
    label: `Q${q + 1} ${now.getFullYear()}`
  };
}

function getYearRange() {
  const y = new Date().getFullYear();
  return {
    start: new Date(y, 0, 1, 0, 0, 0),
    end:   new Date(y, 11, 31, 23, 59, 59),
    label: `Año ${y}`
  };
}

function fmt(val) {
  return `$${parseFloat(val || 0).toFixed(2)}`;
}

function fmtDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function parseDateStr(str) {
  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2000) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function currentMonthName() {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function prevMonthName() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

module.exports = { getMonthRange, getQuarterRange, getYearRange, fmt, fmtDate, parseDateStr, currentMonthName, prevMonthName };
