/**
 * Script para eliminar completamente los ENUMs de la tabla tallas
 * y convertir a VARCHAR con los datos preservados
 */
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function fixTallaEnum() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar la estructura actual
    console.log('\n🔍 Verificando estructura actual...');
    const currentStructure = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'tallas' 
      ORDER BY ordinal_position;
    `);
    console.log('Estructura actual:', currentStructure.rows);

    // 2. Verificar si existen tipos ENUM
    console.log('\n🔍 Verificando tipos ENUM existentes...');
    const enumTypes = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname LIKE '%tallas%' OR typname LIKE '%enum%tallas%';
    `);
    console.log('Tipos ENUM encontrados:', enumTypes.rows);

    // 3. Si la columna es ENUM, convertir a VARCHAR
    const columnInfo = await client.query(`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'tallas' AND column_name = 'tipo_prenda';
    `);

    if (columnInfo.rows[0]?.udt_name?.includes('enum') || columnInfo.rows[0]?.data_type === 'USER-DEFINED') {
      console.log('\n🔧 Convirtiendo columna tipo_prenda de ENUM a VARCHAR...');
      
      // Convertir la columna a VARCHAR manteniendo los datos
      await client.query(`
        ALTER TABLE tallas 
        ALTER COLUMN tipo_prenda TYPE VARCHAR(20) 
        USING tipo_prenda::text;
      `);
      console.log('✅ Columna tipo_prenda convertida a VARCHAR(20)');
    }

    // 4. Hacer lo mismo para la columna genero si es necesario
    const genderColumnInfo = await client.query(`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'tallas' AND column_name = 'genero';
    `);

    if (genderColumnInfo.rows[0]?.udt_name?.includes('enum') || genderColumnInfo.rows[0]?.data_type === 'USER-DEFINED') {
      console.log('\n🔧 Convirtiendo columna genero de ENUM a VARCHAR...');
      
      await client.query(`
        ALTER TABLE tallas 
        ALTER COLUMN genero TYPE VARCHAR(20) 
        USING genero::text;
      `);
      console.log('✅ Columna genero convertida a VARCHAR(20)');
    }

    // 5. Eliminar tipos ENUM huérfanos si existen
    if (enumTypes.rows.length > 0) {
      console.log('\n🗑️ Eliminando tipos ENUM huérfanos...');
      for (const enumType of enumTypes.rows) {
        try {
          await client.query(`DROP TYPE IF EXISTS ${enumType.typname} CASCADE;`);
          console.log(`✅ Tipo ENUM eliminado: ${enumType.typname}`);
        } catch (error) {
          console.log(`⚠️ No se pudo eliminar ${enumType.typname}: ${error.message}`);
        }
      }
    }

    // 6. Verificar la estructura final
    console.log('\n🔍 Verificando estructura final...');
    const finalStructure = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tallas' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Estructura final de la tabla tallas:');
    finalStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // 7. Verificar algunos datos de muestra
    console.log('\n📋 Datos de muestra:');
    const sampleData = await client.query(`
      SELECT id_talla, tipo_prenda, talla, genero, activo 
      FROM tallas 
      ORDER BY id_talla 
      LIMIT 5;
    `);
    
    if (sampleData.rows.length > 0) {
      console.table(sampleData.rows);
    } else {
      console.log('  No hay datos en la tabla');
    }

    console.log('\n✅ Proceso completado exitosamente');
    console.log('🚀 La tabla tallas está lista para sincronización con Sequelize');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    console.error('SQL:', error.sql);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
fixTallaEnum().catch(console.error);
