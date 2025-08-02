'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🗑️ ELIMINANDO TABLA PARROQUIAS DUPLICADA...\n');
      
      // Verificar que la tabla parroquias existe
      const [tables] = await queryInterface.sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'parroquias'
      `, { transaction });

      if (tables.length > 0) {
        console.log('📋 Tabla parroquias encontrada, procediendo a eliminar...');
        
        // 1. Eliminar cualquier constraint FK que apunte a parroquias
        const [constraints] = await queryInterface.sequelize.query(`
          SELECT tc.constraint_name, tc.table_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'parroquias'
        `, { transaction });

        // Eliminar constraints FK
        for (const constraint of constraints) {
          try {
            await queryInterface.removeConstraint(constraint.table_name, constraint.constraint_name, { transaction });
            console.log(`   ✅ Constraint ${constraint.constraint_name} eliminado de ${constraint.table_name}`);
          } catch (error) {
            console.log(`   ⚠️  Constraint ${constraint.constraint_name} no se pudo eliminar:`, error.message);
          }
        }

        // 2. Eliminar columnas FK que apunten a parroquias
        const [foreignKeys] = await queryInterface.sequelize.query(`
          SELECT 
            tc.table_name,
            kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'parroquias'
        `, { transaction });

        for (const fk of foreignKeys) {
          try {
            const tableDescription = await queryInterface.describeTable(fk.table_name);
            if (tableDescription[fk.column_name]) {
              await queryInterface.removeColumn(fk.table_name, fk.column_name, { transaction });
              console.log(`   ✅ Columna FK ${fk.column_name} eliminada de ${fk.table_name}`);
            }
          } catch (error) {
            console.log(`   ⚠️  No se pudo eliminar columna ${fk.column_name} de ${fk.table_name}`);
          }
        }

        // 3. Eliminar la tabla parroquias
        await queryInterface.dropTable('parroquias', { transaction });
        console.log('   ✅ Tabla parroquias eliminada exitosamente');
        
        console.log('\n🎉 TABLA PARROQUIAS ELIMINADA CORRECTAMENTE');
        console.log('📋 La tabla parroquia original se mantiene intacta');
        
      } else {
        console.log('ℹ️  La tabla parroquias ya no existe');
      }

      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error eliminando tabla parroquias:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 RECREANDO TABLA PARROQUIAS...');
      
      // Recrear tabla parroquias como estaba originalmente
      await queryInterface.createTable('parroquias', {
        id_parroquia: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        id_familia_familias: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'familias',
            key: 'id_familia',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
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
      }, { transaction });

      await transaction.commit();
      console.log('✅ Tabla parroquias recreada');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
