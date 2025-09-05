/**
 * Script de migración para agregar campos a la tabla difuntos_familia
 * Fase 3: Agregar id_sexo, id_parentesco, causa_fallecimiento
 * 
 * CAMPOS A AGREGAR:
 * - id_sexo: BIGINT FK a tabla sexos (nullable)
 * - id_parentesco: BIGINT FK a tabla parentescos (nullable)  
 * - causa_fallecimiento: TEXT (nullable)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function applyDifuntosMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de difuntos_familia...');
    
    // Verificar estructura actual de la tabla
    console.log('\n📋 Verificando estructura actual de difuntos_familia...');
    const currentStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura actual:');
    currentStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Verificar que las tablas de referencia existen
    console.log('\n🔍 Verificando tablas de referencia...');
    
    const sexosCheck = await client.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'sexos'");
    const parentescosCheck = await client.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'parentescos'");
    
    if (sexosCheck.rows[0].count === '0') {
      throw new Error('❌ Tabla sexos no encontrada');
    }
    if (parentescosCheck.rows[0].count === '0') {
      throw new Error('❌ Tabla parentescos no encontrada');
    }
    
    console.log('✅ Tablas sexos y parentescos encontradas');
    
    // Lista de campos a agregar
    const fieldsToAdd = [
      {
        name: 'id_sexo',
        definition: 'BIGINT NULL',
        description: 'FK a tabla sexos'
      },
      {
        name: 'id_parentesco', 
        definition: 'BIGINT NULL',
        description: 'FK a tabla parentescos'
      },
      {
        name: 'causa_fallecimiento',
        definition: 'TEXT NULL',
        description: 'Descripción de causa de fallecimiento'
      }
    ];
    
    // Verificar qué campos ya existen
    const existingColumns = currentStructure.rows.map(row => row.column_name);
    console.log('\n🔍 Verificando campos existentes...');
    
    for (const field of fieldsToAdd) {
      if (existingColumns.includes(field.name)) {
        console.log(`⚠️  Campo ${field.name} ya existe, saltando...`);
      } else {
        console.log(`➕ Agregando campo ${field.name} (${field.description})...`);
        
        const addColumnQuery = `
          ALTER TABLE difuntos_familia 
          ADD COLUMN ${field.name} ${field.definition};
        `;
        
        await client.query(addColumnQuery);
        console.log(`✅ Campo ${field.name} agregado exitosamente`);
      }
    }
    
    // Agregar foreign keys si no existen
    console.log('\n🔗 Verificando y agregando foreign keys...');
    
    // Verificar constraints existentes
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'difuntos_familia' AND constraint_type = 'FOREIGN KEY';
    `);
    
    const existingConstraints = constraints.rows.map(row => row.constraint_name);
    
    // FK para id_sexo
    const fkSexoName = 'fk_difuntos_familia_sexo';
    if (!existingConstraints.includes(fkSexoName)) {
      console.log('➕ Agregando FK para id_sexo...');
      await client.query(`
        ALTER TABLE difuntos_familia 
        ADD CONSTRAINT ${fkSexoName} 
        FOREIGN KEY (id_sexo) REFERENCES sexos(id_sexo);
      `);
      console.log('✅ FK id_sexo agregado');
    } else {
      console.log('⚠️  FK para id_sexo ya existe');
    }
    
    // FK para id_parentesco
    const fkParentescoName = 'fk_difuntos_familia_parentesco';
    if (!existingConstraints.includes(fkParentescoName)) {
      console.log('➕ Agregando FK para id_parentesco...');
      await client.query(`
        ALTER TABLE difuntos_familia 
        ADD CONSTRAINT ${fkParentescoName} 
        FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco);
      `);
      console.log('✅ FK id_parentesco agregado');
    } else {
      console.log('⚠️  FK para id_parentesco ya existe');
    }
    
    // Verificar estructura final
    console.log('\n📋 Verificando estructura final de difuntos_familia...');
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura final:');
    finalStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Contar registros
    const countResult = await client.query('SELECT COUNT(*) as total FROM difuntos_familia');
    console.log(`\n📊 Total de registros en difuntos_familia: ${countResult.rows[0].total}`);
    
    console.log('\n🎉 ¡Migración de difuntos_familia completada exitosamente!');
    console.log('\n📋 Resumen de cambios:');
    console.log('   ✅ Campo id_sexo agregado (BIGINT FK a sexos)');
    console.log('   ✅ Campo id_parentesco agregado (BIGINT FK a parentescos)');
    console.log('   ✅ Campo causa_fallecimiento agregado (TEXT)');
    console.log('   ✅ Foreign keys configurados correctamente');
    console.log('   ✅ Datos existentes preservados');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar migración
if (require.main === module) {
  applyDifuntosMigration()
    .then(() => {
      console.log('\n✨ Migración completada. Cerrando conexión...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en migración:', error.message);
      process.exit(1);
    });
}

module.exports = { applyDifuntosMigration };
