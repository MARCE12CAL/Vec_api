'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bot_sessions', {
      phoneNumber: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      state: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'AWAITING_RUC'
      },
      COM_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'seg_maecompania',
          key: 'COM_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tempRuc: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bot_sessions');
  }
};
