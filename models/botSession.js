module.exports = (sequelize, DataTypes) => {
  const BotSession = sequelize.define('BotSession', {
    phoneNumber: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'AWAITING_RUC'
    },
    COM_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tempRuc: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    tableName: 'bot_sessions',
    timestamps: true
  });

  BotSession.associate = (models) => {
    BotSession.belongsTo(models.Compania, { foreignKey: 'COM_CODIGO' });
  };

  return BotSession;
};
