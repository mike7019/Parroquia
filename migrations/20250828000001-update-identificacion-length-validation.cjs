'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Aplicando migración: Actualización de validación de longitud para campo identificación...');
    
    try {
      // Verificar registros que exceden 15 dígitos numéricos
      const [results] = await queryInterface.sequelize.query(`
        SELECT 
          id_personas,
          identificacion,
          REGEXP_REPLACE(identificacion, '[^0-9]', '', 'g') as solo_numeros,
          LENGTH(REGEXP_REPLACE(identificacion, '[^0-9]', '', 'g')) as longitud_numerica
        FROM personas 
        WHERE LENGTH(REGEXP_REPLACE(identificacion, '[^0-9]', '', 'g')) > 15
        AND identificacion NOT LIKE 'FALLECIDO_%'
        AND identificacion NOT LIKE 'TEMP_%';
      `);

      if (results.length > 0) {
        console.log(`⚠️ Se encontraron ${results.length} registros con identificaciones que exceden 15 dígitos:`);
        results.forEach(record => {
          console.log(`   - ID: ${record.id_personas}, Identificación: ${record.identificacion}, Dígitos: ${record.longitud_numerica}`);
        });
        
        console.log('❌ Por favor, corrija estos registros manualmente antes de aplicar la migración.');
        console.log('💡 Sugerencia: Actualice las identificaciones para que contengan máximo 15 dígitos numéricos.');
        
        // No aplicar la migración si hay datos que no cumplen la nueva restricción
        throw new Error('Existen registros que no cumplen con la nueva validación de máximo 15 dígitos');
      }

      console.log('✅ Todos los registros existentes cumplen con la nueva validación de máximo 15 dígitos');
      console.log('📝 La validación se implementa a nivel de aplicación (modelo Sequelize)');
      console.log('🎯 No se requieren cambios en la estructura de la base de datos');

    } catch (error) {
      console.error('❌ Error durante la migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo migración: Eliminación de validación de longitud para identificación...');
    console.log('📝 La reversión se maneja a nivel de aplicación (modelo Sequelize)');
    console.log('✅ No se requieren cambios en la estructura de la base de datos');
  }
};
