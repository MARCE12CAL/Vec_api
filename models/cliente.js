module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    CLI_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CLI_NOMBRE: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    CLI_RUCIDE: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    tableName: 'ven_maecliente',
    timestamps: false
  });

  Cliente.associate = (models) => {
    Cliente.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
    Cliente.hasMany(models.FacturaEnc, { foreignKey: 'CLI_CODIGO' });
  };

  return Cliente;
};
