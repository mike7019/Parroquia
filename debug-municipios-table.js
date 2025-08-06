import { Client } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'admin'
});

async function debugMunicipiosTable() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');
    
    console.log('\n📋 Estructura de la tabla municipios:');
    console.log('=' .repeat(80));
    
    // Obtener estructura de la tabla
    const tableStructure = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      ORDER BY ordinal_position;
    `);
    
    if (tableStructure.rows.length === 0) {
      console.log('❌ La tabla "municipios" no existe');
      return;
    }
    
    console.table(tableStructure.rows);
    
    // Verificar si existe created_at
    const hasCreatedAt = tableStructure.rows.find(row => row.column_name === 'created_at');
    const hasUpdatedAt = tableStructure.rows.find(row => row.column_name === 'updated_at');
    
    console.log('\n🔍 Análisis de columnas timestamp:');
    console.log('=' .repeat(50));
    console.log(`created_at existe: ${hasCreatedAt ? '✅ SÍ' : '❌ NO'}`);
    console.log(`updated_at existe: ${hasUpdatedAt ? '✅ SÍ' : '❌ NO'}`);
    
    if (hasCreatedAt) {
      console.log(`created_at es nullable: ${hasCreatedAt.is_nullable === 'YES' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`created_at default: ${hasCreatedAt.column_default || 'Sin default'}`);
    }
    
    if (hasUpdatedAt) {
      console.log(`updated_at es nullable: ${hasUpdatedAt.is_nullable === 'YES' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`updated_at default: ${hasUpdatedAt.column_default || 'Sin default'}`);
    }
    
    // Contar registros existentes
    console.log('\n📊 Datos existentes:');
    console.log('=' .repeat(30));
    const countResult = await client.query('SELECT COUNT(*) as total FROM municipios');
    console.log(`Total de municipios: ${countResult.rows[0].total}`);
    
    // Mostrar algunos registros de ejemplo
    if (parseInt(countResult.rows[0].total) > 0) {
      console.log('\n📄 Primeros 3 registros:');
      const sampleData = await client.query('SELECT * FROM municipios LIMIT 3');
      console.table(sampleData.rows);
    }
    
    // Diagnóstico del problema
    console.log('\n🩺 DIAGNÓSTICO:');
    console.log('=' .repeat(50));
    
    if (hasCreatedAt && hasCreatedAt.is_nullable === 'NO') {
      console.log('❌ PROBLEMA IDENTIFICADO:');
      console.log('   La columna created_at existe pero es NOT NULL');
      console.log('   El modelo Sequelize tiene timestamps: false');
      console.log('   Esto causa conflicto al insertar registros');
      console.log('\n💡 SOLUCIONES POSIBLES:');
      console.log('   1. Cambiar el modelo a timestamps: true');
      console.log('   2. Hacer la columna created_at nullable');
      console.log('   3. Agregar un valor por defecto a created_at');
    } else if (!hasCreatedAt) {
      console.log('✅ La tabla no tiene columna created_at');
      console.log('   El modelo con timestamps: false es correcto');
    } else {
      console.log('✅ La columna created_at es nullable');
      console.log('   No debería haber problemas con timestamps: false');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔚 Conexión cerrada');
  }
}

// Ejecutar el diagnóstico
debugMunicipiosTable().catch(console.error);
