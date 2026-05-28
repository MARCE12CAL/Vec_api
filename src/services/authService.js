const { sourceDb: db } = require('../sourceDatabase');
const ameliaApi = require('./ameliaApi');

async function getCompanyByRuc(ruc) {
  const r = await ameliaApi.getEmpresa(ruc);
  if (!r) return null;
  return {
    COM_CODIGO: r.COM_CODIGO || r.comCodigo || r.codigo || null,
    COM_NOMBRE: r.COM_NOMBRE || r.comNombre || r.nombre || ''
  };
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
