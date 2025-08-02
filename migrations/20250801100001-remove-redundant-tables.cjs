'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🗑️ PASO 1: Eliminando tablas redundantes...');
    
    // 1. Eliminar constraint FK antes de eliminar tabla parroquia
    try {
      // Buscar y eliminar todas las constraints FK que referencian a parroquia
      const [constraints] = await queryInterface.sequelize.query(`
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%parroquia%'
      `);

      for (const constraint of constraints) {
        try {
          await queryInterface.removeConstraint(constraint.table_name, constraint.constraint_name);
          console.log(`   ✅ Constraint ${constraint.constraint_name} eliminado de ${constraint.table_name}`);
        } catch (error) {
          console.log(`   ⚠️ No se pudo eliminar constraint ${constraint.constraint_name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log('   ⚠️ Error buscando constraints:', error.message);
    }

    // 2. Actualizar referencias a NULL en tabla personas
    await queryInterface.bulkUpdate('personas', 
      { id_parroquia_parroquia: null },
      { id_parroquia_parroquia: { [Sequelize.Op.ne]: null } }
    );
    console.log('   ✅ Referencias FK actualizadas a NULL en personas');

    // 3. Eliminar tabla parroquia
    try {
      await queryInterface.dropTable('parroquia');
      console.log('   ✅ Tabla parroquia eliminada');
    } catch (error) {
      console.log(`   ⚠️ Error eliminando tabla parroquia: ${error.message}`);
    }

    // 4. Eliminar tabla intermedia innecesaria si existe
    try {
      await queryInterface.dropTable('veredas_has_many_familias');
      console.log('   ✅ Tabla veredas_has_many_familias eliminada');
    } catch (error) {
      console.log('   ⚠️ Tabla veredas_has_many_familias no existe o ya fue eliminada');
    }

    console.log('✅ Eliminación de tablas redundantes completada');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo eliminación de tablas...');
    
    // Recrear tabla parroquia
    await queryInterface.createTable('parroquia', {
      id_parroquia: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Recrear constraint FK en personas
    await queryInterface.addConstraint('personas', {
      fields: ['id_parroquia_parroquia'],
      type: 'foreign key',
      name: 'fk_personas_parroquia',
      references: {
        table: 'parroquia',
        field: 'id_parroquia',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    console.log('✅ Reversión completada');
  }
};
