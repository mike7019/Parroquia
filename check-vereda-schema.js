#!/usr/bin/env node

import sequelize from './config/sequelize.js';

async function checkVeredaSchema() {
  try {
    console.log('🔍 Verificando estructura de tabla veredas...');
    
    const [result] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas actuales en tabla veredas:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? '(' + col.character_maximum_length + ')' : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Verificar constraints
    console.log('\n🔗 Verificando constraints...');
    const [constraints] = await sequelize.query(`
      SELECT constraint_name, constraint_type, column_name
      FROM information_schema.constraint_column_usage ccu
      JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
      WHERE ccu.table_name = 'veredas'
    `);
    
    constraints.forEach(c => {
      console.log(`  - ${c.constraint_name}: ${c.constraint_type} on ${c.column_name}`);
    });

    // Verificar algunos registros de ejemplo
    console.log('\n📊 Datos de ejemplo:');
    const [examples] = await sequelize.query(`
      SELECT * FROM veredas LIMIT 3
    `);
    
    console.log('Registros de ejemplo:', examples);

    // Probar insert directo
    console.log('\n🧪 Probando insert directo...');
    try {
      const [insertResult] = await sequelize.query(`
        INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios)
        VALUES ('Test Vereda', 'TEST001', NULL)
        RETURNING *
      `);
      console.log('✅ Insert directo exitoso:', insertResult);
      
      // Limpiar el registro de prueba
      await sequelize.query(`DELETE FROM veredas WHERE codigo_vereda = 'TEST001'`);
      console.log('🧹 Registro de prueba eliminado');
    } catch (insertError) {
      console.error('❌ Error en insert directo:', insertError.message);
    }

  } catch (error) {
    console.error('❌ Error verificando schema:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkVeredaSchema();
