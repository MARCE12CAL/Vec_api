module.exports = (sequelize, DataTypes) => {
  const FacturaDet = sequelize.define('FacturaDet', {
    DETFAC_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ENCFAC_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ART_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DETFAC_CANTIDAD: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    DETFAC_TOTAL: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    tableName: 'ven_detfac',
    timestamps: false
  });

  FacturaDet.associate = (models) => {
    FacturaDet.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
    FacturaDet.belongsTo(models.FacturaEnc, { foreignKey: 'ENCFAC_CODIGO', as: 'Factura' });
    FacturaDet.belongsTo(models.Articulo, { foreignKey: 'ART_CODIGO', as: 'Articulo' });
  };

  return FacturaDet;
};
