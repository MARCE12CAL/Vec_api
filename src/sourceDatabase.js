require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.SOURCE_DB_NAME,
  process.env.SOURCE_DB_USER,
  process.env.SOURCE_DB_PASSWORD,
  {
    host: process.env.SOURCE_DB_HOST,
    port: parseInt(process.env.SOURCE_DB_PORT || '7639', 10),
    dialect: process.env.SOURCE_DB_DIALECT || 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '-05:00',
    define: {
      timestamps: false  // La BD remota no tiene columnas createdAt/updatedAt
    }
  }
);

const sourceDb = {};

sourceDb.Compania = require('../models/compania')(sequelize, DataTypes);
sourceDb.Usuario = require('../models/usuario')(sequelize, DataTypes);
sourceDb.Cliente = require('../models/cliente')(sequelize, DataTypes);
sourceDb.Grupo = require('../models/grupo')(sequelize, DataTypes);
sourceDb.Articulo = require('../models/articulo')(sequelize, DataTypes);
sourceDb.FacturaEnc = require('../models/facturaEnc')(sequelize, DataTypes);
sourceDb.FacturaDet = require('../models/facturaDet')(sequelize, DataTypes);

Object.keys(sourceDb).forEach(modelName => {
  if (sourceDb[modelName].associate) {
    sourceDb[modelName].associate(sourceDb);
  }
});

sourceDb.sequelize = sequelize;
sourceDb.Sequelize = Sequelize;

async function initSourceDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos fuente (remota) establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos fuente:', error.message);
    process.exit(1);
  }
}

module.exports = { sourceDb, initSourceDatabase };
