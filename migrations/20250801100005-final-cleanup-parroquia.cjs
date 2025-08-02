'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🗑️ PASO FINAL: Eliminando tabla parroquia restante...');
    
    // 1. Buscar y eliminar todas las dependencias que bloquean la eliminación
    try {
      const [dependencies] = await queryInterface.sequelize.query(`
        SELECT DISTINCT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'parroquia';
      `);

      console.log(`   - Encontradas ${dependencies.length} dependencias a eliminar`);

      // Eliminar todas las constraints FK que referencian parroquia
      for (const dep of dependencies) {
        try {
          await queryInterface.removeConstraint(dep.table_name, dep.constraint_name);
          console.log(`   ✅ Constraint ${dep.constraint_name} eliminado de ${dep.table_name}`);
        } catch (error) {
          console.log(`   ⚠️ Error eliminando constraint ${dep.constraint_name}: ${error.message}`);
        }
      }

    } catch (error) {
      console.log(`   ⚠️ Error buscando dependencias: ${error.message}`);
    }

    // 2. Eliminar columnas FK que referencian parroquia
    try {
      // Verificar si existe la columna id_parroquia_parroquia en personas
      const personasColumns = await queryInterface.describeTable('personas');
      if (personasColumns.id_parroquia_parroquia) {
        await queryInterface.removeColumn('personas', 'id_parroquia_parroquia');
        console.log('   ✅ Columna id_parroquia_parroquia eliminada de personas');
      }
    } catch (error) {
      console.log(`   ⚠️ Error eliminando columna FK: ${error.message}`);
    }

    // 3. Finalmente eliminar la tabla parroquia
    try {
      await queryInterface.dropTable('parroquia');
      console.log('   ✅ Tabla parroquia eliminada exitosamente');
    } catch (error) {
      console.log(`   ❌ Error eliminando tabla parroquia: ${error.message}`);
      
      // Si aún falla, usar CASCADE
      try {
        await queryInterface.sequelize.query('DROP TABLE parroquia CASCADE');
        console.log('   ✅ Tabla parroquia eliminada con CASCADE');
      } catch (cascadeError) {
        console.log(`   ❌ Error final: ${cascadeError.message}`);
      }
    }

    console.log('✅ Eliminación final completada');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo eliminación final...');
    
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

    // Recrear columna FK en personas
    await queryInterface.addColumn('personas', 'id_parroquia_parroquia', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'parroquia',
        key: 'id_parroquia',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    console.log('✅ Reversión completada');
  }
};
