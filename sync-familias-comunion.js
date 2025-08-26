/**
 * Script para sincronizar específicamente el modelo Familias y agregar comunionEnCasa
 */

import sequelize from './config/sequelize.js';
import Familias from './src/models/catalog/Familias.js';

console.log('🔧 Iniciando sincronización específica del modelo Familias...');

async function syncFamiliasModel() {
  try {
    console.log('📡 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar si la columna ya existe
    console.log('🔍 Verificando estructura actual de la tabla familias...');
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'comunionEnCasa'
    `);

    if (results.length > 0) {
      console.log('✅ La columna comunionEnCasa ya existe en la tabla familias');
      return;
    }

    console.log('🔄 Sincronizando modelo Familias con ALTER...');
    
    // Sincronizar solo el modelo Familias con ALTER
    await Familias.sync({ alter: true });
    
    console.log('✅ Modelo Familias sincronizado exitosamente');

    // Verificar que la columna se agregó correctamente
    console.log('🔍 Verificando que la columna se agregó correctamente...');
    const [verification] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'comunionEnCasa'
    `);

    if (verification.length > 0) {
      console.log('✅ Verificación exitosa. Detalles de la columna:');
      console.log(verification[0]);
    } else {
      console.log('❌ Error: No se pudo verificar la columna');
    }

    // Mostrar estructura completa de la tabla
    console.log('📋 Estructura actual de la tabla familias:');
    const [tableStructure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position
    `);
    
    tableStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    console.log('🎉 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error al sincronizar el modelo Familias:', error);
    
    if (error.original) {
      console.error('💡 Error original:', error.original.message);
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
syncFamiliasModel();
