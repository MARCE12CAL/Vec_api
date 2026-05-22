'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inv_maegrupo', {
      GRUP_CODIGO: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      COM_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seg_maecompania',
          key: 'COM_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      GRUP_NOMBRE: {
        type: Sequelize.STRING(100),
        allowNull: false
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
    await queryInterface.dropTable('inv_maegrupo');
  }
};
