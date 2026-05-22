'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inv_maearticulo', {
      ART_CODIGO: {
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
      GRUP_CODIGO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inv_maegrupo',
          key: 'GRUP_CODIGO'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ART_NOMBRE: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      ART_CODIGOPRINCIPAL: {
        type: Sequelize.STRING(50),
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
    await queryInterface.addIndex('inv_maearticulo', ['COM_CODIGO', 'ART_CODIGOPRINCIPAL'], {
      name: 'idx_art_cod_comp'
    });
    await queryInterface.addIndex('inv_maearticulo', ['COM_CODIGO', 'ART_NOMBRE'], {
      name: 'idx_art_nom_comp'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inv_maearticulo');
  }
};
