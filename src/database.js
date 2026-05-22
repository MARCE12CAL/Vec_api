const db = require('../models');

async function initDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

module.exports = {
  db,
  initDatabase
};
