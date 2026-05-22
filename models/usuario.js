module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    USU_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    USU_IDENTIFICACION: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    USU_CLAVE: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'seg_maeusuario',
    timestamps: false
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
  };

  return Usuario;
};
