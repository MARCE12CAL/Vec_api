'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ven_encfac', {
      ENCFAC_CODIGO: {
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
      CLI_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ven_maecliente',
          key: 'CLI_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ENCFAC_FECHAEMISION: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ENCFAC_BASEIVA: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      ENCFAC_BASECERO: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      ENCFAC_VALORIVA: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      ENCFAC_TOTAL: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
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
    // Add indexes with explicit names
    await queryInterface.addIndex('ven_encfac', ['COM_CODIGO', 'ENCFAC_FECHAEMISION'], {
      name: 'idx_fac_fecha_comp'
    });
    await queryInterface.addIndex('ven_encfac', ['COM_CODIGO', 'CLI_CODIGO'], {
      name: 'idx_fac_cli_comp'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ven_encfac');
  }
};
