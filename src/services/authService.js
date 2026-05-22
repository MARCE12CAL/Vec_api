const { sourceDb: db } = require('../sourceDatabase');
const axios = require('axios'); // Habilitar si se usa API externa

/**
 * Busca una compañía por su RUC o identificación tributaria.
 * @param {string} ruc RUC de la compañía.
 * @returns {Promise<{COM_CODIGO: number, COM_NOMBRE: string}|null>}
 */
async function getCompanyByRuc(ruc) {
  // ==========================================
  // IMPLEMENTACIÓN OPCIÓN A: Base de datos local (Sequelize)
  // ==========================================
  const compania = await db.Compania.findOne({
    where: { COM_RUCI: ruc }
  });
  
  if (!compania) return null;
  return {
    COM_CODIGO: compania.COM_CODIGO,
    COM_NOMBRE: compania.COM_NOMBRE
  };

  // ==========================================
  // IMPLEMENTACIÓN OPCIÓN B: API REST Externa
  // ==========================================
  /*
  try {
    const response = await axios.get(`${process.env.API_URL}/companies/validate`, {
      params: { ruc },
      headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
    });
    if (response.data && response.data.success) {
      return {
        COM_CODIGO: response.data.company.code,
        COM_NOMBRE: response.data.company.name
      };
    }
    return null;
  } catch (error) {
    console.error('Error al validar compañía vía API:', error.message);
    return null;
  }
  */
}

/**
 * Valida las credenciales de un usuario dentro de una compañía.
 * @param {number} companyCode Código de la compañía.
 * @param {string} username Identificación del usuario (RUC o cédula).
 * @param {string} password Clave de acceso.
 * @returns {Promise<{USU_CODIGO: number, USU_IDENTIFICACION: string}|null>}
 */
async function validateUser(companyCode, username, password) {
  // ==========================================
  // IMPLEMENTACIÓN OPCIÓN A: Base de datos local (Sequelize)
  // ==========================================
  // Clave temporal hardcodeada para pruebas
  if (password === 'admin') {
    return { USU_CODIGO: 0, USU_IDENTIFICACION: username };
  }

  const usuario = await db.Usuario.findOne({
    where: {
      COM_CODIGO: companyCode,
      USU_IDENTIFICACION: username,
      USU_CLAVE: password
    }
  });

  if (!usuario) return null;
  return {
    USU_CODIGO: usuario.USU_CODIGO,
    USU_IDENTIFICACION: usuario.USU_IDENTIFICACION
  };

  // ==========================================
  // IMPLEMENTACIÓN OPCIÓN B: API REST Externa
  // ==========================================
  /*
  try {
    const response = await axios.post(`${process.env.API_URL}/users/login`, {
      companyCode,
      username,
      password
    }, {
      headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
    });
    if (response.data && response.data.success) {
      return {
        USU_CODIGO: response.data.user.code,
        USU_IDENTIFICACION: response.data.user.username
      };
    }
    return null;
  } catch (error) {
    console.error('Error al validar usuario vía API:', error.message);
    return null;
  }
  */
}

module.exports = {
  getCompanyByRuc,
  validateUser
};
