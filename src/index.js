require('dotenv').config();
const { initSourceDatabase } = require('./sourceDatabase');
const { startWhatsAppBot } = require('./bot');

async function main() {
  console.log('🚀 Iniciando Amelia FactBot...');
  await initSourceDatabase();
  await startWhatsAppBot();
}

main().catch(err => {
  console.error('❌ Error crítico al arrancar:', err);
  process.exit(1);
});
