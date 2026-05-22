module.exports = (sequelize, DataTypes) => {
  const Grupo = sequelize.define('Grupo', {
    GRUP_CODIGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    GRUP_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'inv_maegrupo',
    timestamps: false
  });

  Grupo.associate = (models) => {
    Grupo.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
    Grupo.hasMany(models.Articulo, { foreignKey: 'GRUP_CODIGO' });
  };

  return Grupo;
};
