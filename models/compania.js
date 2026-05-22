module.exports = (sequelize, DataTypes) => {
  const Compania = sequelize.define('Compania', {
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_RUCI: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    },
    COM_NOMBRE: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    tableName: 'seg_maecompania',
    timestamps: false
  });

  Compania.associate = (models) => {
    Compania.hasMany(models.Usuario, { foreignKey: 'COM_CODIGO' });
    Compania.hasMany(models.Cliente, { foreignKey: 'COM_CODIGO' });
    Compania.hasMany(models.Grupo, { foreignKey: 'COM_CODIGO' });
    Compania.hasMany(models.Articulo, { foreignKey: 'COM_CODIGO' });
    Compania.hasMany(models.FacturaEnc, { foreignKey: 'COM_CODIGO' });
    Compania.hasMany(models.FacturaDet, { foreignKey: 'COM_CODIGO' });
  };

  return Compania;
};
