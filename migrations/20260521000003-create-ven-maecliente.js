'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ven_maecliente', {
      CLI_CODIGO: {
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
      CLI_NOMBRE: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      CLI_RUCIDE: {
        type: Sequelize.STRING(15),
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
    // Add index for searching with explicit names
    await queryInterface.addIndex('ven_maecliente', ['COM_CODIGO', 'CLI_RUCIDE'], {
      name: 'idx_cli_ruc_comp'
    });
    await queryInterface.addIndex('ven_maecliente', ['COM_CODIGO', 'CLI_NOMBRE'], {
      name: 'idx_cli_nom_comp'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ven_maecliente');
  }
};
