module.exports = (sequelize, DataTypes) => {
  const FacturaEnc = sequelize.define('FacturaEnc', {
    ENCFAC_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CLI_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ENCFAC_FECHAEMISION: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ENCFAC_BASEIVA: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    ENCFAC_BASECERO: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    ENCFAC_VALORIVA: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    ENCFAC_TOTAL: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    tableName: 'ven_encfac',
    timestamps: false
  });

  FacturaEnc.associate = (models) => {
    FacturaEnc.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
    FacturaEnc.belongsTo(models.Cliente, { foreignKey: 'CLI_CODIGO', as: 'Cliente' });
    FacturaEnc.hasMany(models.FacturaDet, { foreignKey: 'ENCFAC_CODIGO', as: 'Detalles' });
  };

  return FacturaEnc;
};
