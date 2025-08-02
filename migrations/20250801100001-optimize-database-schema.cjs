'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 INICIANDO OPTIMIZACIÓN DEL ESQUEMA DE BASE DE DATOS...\n');

      // ================================================================
      // 1. ELIMINAR TABLAS REDUNDANTES/INNECESARIAS
      // ================================================================
      
      console.log('📋 PASO 1: Eliminando tablas redundantes...');
      
      // 1.1 Eliminar tabla parroquias duplicada (mantener parroquia original)
      console.log('   - Eliminando tabla parroquias duplicada...');
      
      if (await tableExists(queryInterface, 'parroquias')) {
        // Primero eliminar cualquier FK constraint que apunte a parroquias
        try {
          await queryInterface.removeConstraint('familias', 'familias_id_parroquia_parroquias_fkey');
        } catch (error) {
          console.log('   ⚠️  Constraint familias_id_parroquia_parroquias_fkey no existe');
        }

        // Eliminar cualquier columna FK que apunte a parroquias
        const familiasColumns = await queryInterface.describeTable('familias');
        if (familiasColumns.id_parroquia_parroquias) {
          await queryInterface.removeColumn('familias', 'id_parroquia_parroquias', { transaction });
          console.log('   ✅ Columna id_parroquia_parroquias eliminada de familias');
        }

        // Eliminar tabla parroquias
        await queryInterface.dropTable('parroquias', { transaction });
        console.log('   ✅ Tabla parroquias eliminada (manteniendo parroquia original)');
      }

      // 1.2 Eliminar tabla intermedia innecesaria
      if (await tableExists(queryInterface, 'veredas_has_many_familias')) {
        await queryInterface.dropTable('veredas_has_many_familias', { transaction });
        console.log('   ✅ Tabla veredas_has_many_familias eliminada');
      }

      // ================================================================
      // 2. ELIMINAR CAMPOS REDUNDANTES
      // ================================================================
      
      console.log('\n📋 PASO 2: Eliminando campos redundantes...');
      
      // 2.1 Eliminar campo sexo redundante de personas (ya existe id_sexo_sexo)
      const personasColumns = await queryInterface.describeTable('personas');
      
      if (personasColumns.sexo) {
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
        console.log('   ✅ Campo sexo redundante eliminado de personas');
      }

      // ================================================================
      // 3. OPTIMIZAR NOMENCLATURA DE RELACIONES
      // ================================================================
      
      console.log('\n📋 PASO 3: Optimizando nomenclatura de relaciones...');
      
      // 3.1 Optimizar tabla persona_destreza
      if (await tableExists(queryInterface, 'persona_destreza')) {
        const personaDestrezaColumns = await queryInterface.describeTable('persona_destreza');
        
        if (personaDestrezaColumns.id_personas_personas) {
          await queryInterface.renameColumn('persona_destreza', 'id_personas_personas', 'id_persona', { transaction });
          console.log('   ✅ Campo id_personas_personas → id_persona');
        }
        
        if (personaDestrezaColumns.id_destrezas_destrezas) {
          await queryInterface.renameColumn('persona_destreza', 'id_destrezas_destrezas', 'id_destreza', { transaction });
          console.log('   ✅ Campo id_destrezas_destrezas → id_destreza');
        }
      }

      // 3.2 Optimizar tabla persona_enfermedad
      if (await tableExists(queryInterface, 'persona_enfermedad')) {
        const personaEnfermedadColumns = await queryInterface.describeTable('persona_enfermedad');
        
        if (!personaEnfermedadColumns.id_persona && personaEnfermedadColumns.id_personas) {
          await queryInterface.renameColumn('persona_enfermedad', 'id_personas', 'id_persona', { transaction });
        }
        
        if (!personaEnfermedadColumns.id_enfermedad && personaEnfermedadColumns.id_enfermedades) {
          await queryInterface.renameColumn('persona_enfermedad', 'id_enfermedades', 'id_enfermedad', { transaction });
        }
      }

      // ================================================================
      // 4. CREAR ÍNDICES PARA OPTIMIZACIÓN
      // ================================================================
      
      console.log('\n📋 PASO 4: Creando índices para optimización...');
      
      // Índices para mejorar rendimiento en consultas frecuentes
      const indexes = [
        { table: 'personas', columns: ['identificacion'], name: 'idx_personas_identificacion' },
        { table: 'personas', columns: ['correo_electronico'], name: 'idx_personas_email' },
        { table: 'personas', columns: ['id_familia_familias'], name: 'idx_personas_familia' },
        { table: 'familias', columns: ['id_vereda_veredas'], name: 'idx_familias_vereda' },
        { table: 'veredas', columns: ['id_municipio_municipios'], name: 'idx_veredas_municipio' },
      ];

      for (const index of indexes) {
        try {
          await queryInterface.addIndex(index.table, index.columns, {
            name: index.name,
            transaction
          });
          console.log(`   ✅ Índice ${index.name} creado`);
        } catch (error) {
          console.log(`   ⚠️  Índice ${index.name} ya existe`);
        }
      }

      await transaction.commit();
      console.log('\n🎉 OPTIMIZACIÓN DEL ESQUEMA COMPLETADA EXITOSAMENTE');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error durante la optimización:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 REVIRTIENDO OPTIMIZACIONES...');
      
      // Recrear tabla parroquias
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

      // Restaurar campo sexo en personas
      await queryInterface.addColumn('personas', 'sexo', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Masculino',
      }, { transaction });

      // Revertir nombres de columnas
      await queryInterface.renameColumn('persona_destreza', 'id_persona', 'id_personas_personas', { transaction });
      await queryInterface.renameColumn('persona_destreza', 'id_destreza', 'id_destrezas_destrezas', { transaction });

      await transaction.commit();
      console.log('✅ Reversión completada');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

// Función auxiliar para verificar si una tabla existe
async function tableExists(queryInterface, tableName) {
  try {
    const [results] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${tableName}'
    `);
    return results.length > 0;
  } catch (error) {
    return false;
  }
}
