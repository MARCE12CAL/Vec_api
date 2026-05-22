'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('seg_maeusuario', {
      USU_CODIGO: {
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
      USU_IDENTIFICACION: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      USU_CLAVE: {
        type: Sequelize.STRING(255),
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
    // Add unique constraint for (COM_CODIGO, USU_IDENTIFICACION)
    await queryInterface.addIndex('seg_maeusuario', ['COM_CODIGO', 'USU_IDENTIFICACION'], {
      unique: true,
      name: 'unique_user_per_company'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('seg_maeusuario');
  }
};
