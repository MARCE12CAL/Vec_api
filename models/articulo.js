module.exports = (sequelize, DataTypes) => {
  const Articulo = sequelize.define('Articulo', {
    ART_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    GRUP_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ART_NOMBRE: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ART_CODIGOPRINCIPAL: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'inv_maearticulo',
    timestamps: false
  });

  Articulo.associate = (models) => {
    Articulo.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
    Articulo.belongsTo(models.Grupo, { foreignKey: 'GRUP_CODIGO' });
    Articulo.hasMany(models.FacturaDet, { foreignKey: 'ART_CODIGO' });
  };

  return Articulo;
};
