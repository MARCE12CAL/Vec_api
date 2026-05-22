'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('seg_maecompania', {
      COM_CODIGO: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      COM_RUCI: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
      },
      COM_NOMBRE: {
        type: Sequelize.STRING(150),
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
    await queryInterface.dropTable('seg_maecompania');
  }
};
