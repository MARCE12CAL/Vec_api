const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const db = {};

// Import models
db.Compania = require('./compania')(sequelize, DataTypes);
db.Usuario = require('./usuario')(sequelize, DataTypes);
db.Cliente = require('./cliente')(sequelize, DataTypes);
db.Grupo = require('./grupo')(sequelize, DataTypes);
db.Articulo = require('./articulo')(sequelize, DataTypes);
db.FacturaEnc = require('./facturaEnc')(sequelize, DataTypes);
db.FacturaDet = require('./facturaDet')(sequelize, DataTypes);
db.BotSession = require('./botSession')(sequelize, DataTypes);

// Execute associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
