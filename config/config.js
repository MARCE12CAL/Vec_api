require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MiPassword2025!',
    database: process.env.DB_NAME || 'amelia_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '-05:00' // Matches the user's OS timezone offset
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '-05:00'
  }
};
