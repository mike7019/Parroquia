'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 PASO 4: Creando índices para optimización de rendimiento...');
    
    // Lista de índices a crear
    const indexes = [
      {
        table: 'personas',
        fields: ['identificacion'],
        options: {
          name: 'idx_personas_identificacion',
          unique: false
        }
      },
      {
        table: 'personas',
        fields: ['correo_electronico'],
        options: {
          name: 'idx_personas_email',
          unique: false
        }
      },
      {
        table: 'personas',
        fields: ['id_familia_familias'],
        options: {
          name: 'idx_personas_familia',
          unique: false
        }
      },
      {
        table: 'familias',
        fields: ['id_vereda_veredas'],
        options: {
          name: 'idx_familias_vereda',
          unique: false
        }
      },
      {
        table: 'veredas',
        fields: ['id_municipio_municipios'],
        options: {
          name: 'idx_veredas_municipio',
          unique: false
        }
      },
      {
        table: 'municipios',
        fields: ['nombre_municipio'],
        options: {
          name: 'idx_municipios_nombre',
          unique: false
        }
      },
      {
        table: 'familias',
        fields: ['id_municipio'],
        options: {
          name: 'idx_familias_municipio',
          unique: false
        }
      },
      {
        table: 'familias',
        fields: ['id_sector'],
        options: {
          name: 'idx_familias_sector',
          unique: false
        }
      }
    ];

    // Crear cada índice
    for (const index of indexes) {
      try {
        await queryInterface.addIndex(index.table, index.fields, index.options);
        console.log(`   ✅ Índice ${index.options.name} creado en tabla ${index.table}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Índice ${index.options.name} ya existe en tabla ${index.table}`);
        } else {
          console.log(`   ❌ Error creando índice ${index.options.name}: ${error.message}`);
        }
      }
    }

    console.log('✅ Creación de índices completada');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo creación de índices...');
    
    // Lista de índices a eliminar
    const indexesToRemove = [
      { table: 'personas', name: 'idx_personas_identificacion' },
      { table: 'personas', name: 'idx_personas_email' },
      { table: 'personas', name: 'idx_personas_familia' },
      { table: 'familias', name: 'idx_familias_vereda' },
      { table: 'veredas', name: 'idx_veredas_municipio' },
      { table: 'municipios', name: 'idx_municipios_nombre' },
      { table: 'familias', name: 'idx_familias_municipio' },
      { table: 'familias', name: 'idx_familias_sector' }
    ];

    // Eliminar cada índice
    for (const index of indexesToRemove) {
      try {
        await queryInterface.removeIndex(index.table, index.name);
        console.log(`   ✅ Índice ${index.name} eliminado de tabla ${index.table}`);
      } catch (error) {
        console.log(`   ⚠️ Error eliminando índice ${index.name}: ${error.message}`);
      }
    }

    console.log('✅ Reversión de índices completada');
  }
};
