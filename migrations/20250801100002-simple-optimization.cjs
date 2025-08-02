'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 INICIANDO OPTIMIZACIÓN SIMPLE DEL ESQUEMA...\n');

      // ================================================================
      // 1. ELIMINAR CAMPO SEXO REDUNDANTE (SIMPLE)
      // ================================================================
      
      console.log('📋 PASO 1: Eliminando campo sexo redundante...');
      
      // Verificar si existe el campo sexo
      try {
        await queryInterface.sequelize.query(`
          SELECT sexo FROM personas LIMIT 1
        `, { transaction });
        
        // El campo existe, proceder a eliminarlo
        console.log('   - Campo sexo detectado, procediendo a eliminar...');
        
        // Primero actualizar registros que no tengan id_sexo_sexo
        await queryInterface.sequelize.query(`
          UPDATE personas 
          SET id_sexo_sexo = CASE 
            WHEN LOWER(sexo) LIKE '%masculino%' OR LOWER(sexo) LIKE '%hombre%' THEN 1
            WHEN LOWER(sexo) LIKE '%femenino%' OR LOWER(sexo) LIKE '%mujer%' THEN 2
            ELSE 1 
          END
          WHERE id_sexo_sexo IS NULL AND sexo IS NOT NULL
        `, { transaction });
        
        // Eliminar campo redundante
        await queryInterface.removeColumn('personas', 'sexo', { transaction });
        console.log('   ✅ Campo sexo eliminado exitosamente');
        
      } catch (error) {
        console.log('   ⚠️  Campo sexo no existe o ya fue eliminado');
      }

      // ================================================================
      // 2. OPTIMIZAR NOMENCLATURA PERSONA_DESTREZA
      // ================================================================
      
      console.log('\n📋 PASO 2: Optimizando nomenclatura persona_destreza...');
      
      try {
        // Verificar estructura actual de persona_destreza
        const [columns] = await queryInterface.sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'persona_destreza' 
          AND column_name IN ('id_personas_personas', 'id_destrezas_destrezas')
        `, { transaction });
        
        if (columns.length > 0) {
          // Verificar si existe id_personas_personas
          const hasOldPersonaCol = columns.some(col => col.column_name === 'id_personas_personas');
          const hasOldDestrezaCol = columns.some(col => col.column_name === 'id_destrezas_destrezas');
          
          if (hasOldPersonaCol) {
            await queryInterface.renameColumn('persona_destreza', 'id_personas_personas', 'id_persona', { transaction });
            console.log('   ✅ Campo id_personas_personas → id_persona');
          }
          
          if (hasOldDestrezaCol) {
            await queryInterface.renameColumn('persona_destreza', 'id_destrezas_destrezas', 'id_destreza', { transaction });
            console.log('   ✅ Campo id_destrezas_destrezas → id_destreza');
          }
          
        } else {
          console.log('   ⚠️  Columnas ya optimizadas o no existen');
        }
        
      } catch (error) {
        console.log('   ⚠️  Error optimizando persona_destreza:', error.message);
      }

      // ================================================================
      // 3. CREAR ÍNDICES BÁSICOS
      // ================================================================
      
      console.log('\n📋 PASO 3: Creando índices básicos...');
      
      const basicIndexes = [
        { table: 'personas', columns: ['identificacion'], name: 'idx_personas_identificacion_opt' },
        { table: 'personas', columns: ['correo_electronico'], name: 'idx_personas_email_opt' },
      ];

      for (const index of basicIndexes) {
        try {
          await queryInterface.addIndex(index.table, index.columns, {
            name: index.name,
            transaction
          });
          console.log(`   ✅ Índice ${index.name} creado`);
        } catch (error) {
          console.log(`   ⚠️  Índice ${index.name} ya existe o error: ${error.message.substring(0, 50)}...`);
        }
      }

      await transaction.commit();
      console.log('\n🎉 OPTIMIZACIÓN SIMPLE COMPLETADA EXITOSAMENTE');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error durante la optimización:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 REVIRTIENDO OPTIMIZACIONES SIMPLES...');
      
      // Restaurar campo sexo en personas
      await queryInterface.addColumn('personas', 'sexo', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Masculino',
      }, { transaction });

      // Revertir nombres de columnas si existen
      try {
        await queryInterface.renameColumn('persona_destreza', 'id_persona', 'id_personas_personas', { transaction });
        await queryInterface.renameColumn('persona_destreza', 'id_destreza', 'id_destrezas_destrezas', { transaction });
      } catch (error) {
        console.log('⚠️  Error revirtiendo nombres de columnas');
      }

      // Eliminar índices
      try {
        await queryInterface.removeIndex('personas', 'idx_personas_identificacion_opt', { transaction });
        await queryInterface.removeIndex('personas', 'idx_personas_email_opt', { transaction });
      } catch (error) {
        console.log('⚠️  Error eliminando índices');
      }

      await transaction.commit();
      console.log('✅ Reversión completada');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
