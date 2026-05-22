'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ven_detfac', {
      DETFAC_CODIGO: {
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
      ENCFAC_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ven_encfac',
          key: 'ENCFAC_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ART_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inv_maearticulo',
          key: 'ART_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      DETFAC_CANTIDAD: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      DETFAC_TOTAL: {
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
    await queryInterface.addIndex('ven_detfac', ['COM_CODIGO', 'ENCFAC_CODIGO'], {
      name: 'idx_det_fac_comp'
    });
    await queryInterface.addIndex('ven_detfac', ['COM_CODIGO', 'ART_CODIGO'], {
      name: 'idx_det_art_comp'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ven_detfac');
  }
};
