/**
 * Script para validar la estructura de la tabla veredas en el servidor
 * y diagnosticar problemas de sincronización
 */
import { Client } from 'pg';
import dotenv from 'dotenv';
import sequelize from './config/sequelize.js';
import Veredas from './src/models/catalog/Veredas.js';

dotenv.config();

async function validateVeredasStructure() {
  console.log('🔍 Validando estructura de tabla veredas en el servidor...\n');
  
  try {
    // 1. Conectar directamente a PostgreSQL
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await client.connect();
    console.log('✅ Conexión a base de datos establecida\n');

    // 2. Verificar si la tabla veredas existe
    console.log('📋 Verificando existencia de tabla veredas...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'veredas'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla veredas NO EXISTE en el servidor');
      console.log('💡 Solución: Ejecutar sincronización de base de datos');
      await client.end();
      return;
    }

    console.log('✅ La tabla veredas existe\n');

    // 3. Obtener estructura actual de la tabla
    console.log('📊 Estructura actual de la tabla veredas:');
    const currentStructure = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    if (currentStructure.rows.length === 0) {
      console.log('❌ No se pudieron obtener las columnas de la tabla veredas');
      await client.end();
      return;
    }

    console.table(currentStructure.rows);

    // 4. Verificar específicamente la columna codigo_vereda
    const codigoVeredaExists = currentStructure.rows.find(col => col.column_name === 'codigo_vereda');
    
    if (!codigoVeredaExists) {
      console.log('\n❌ PROBLEMA ENCONTRADO: La columna "codigo_vereda" NO EXISTE');
      console.log('🔧 Esta columna es requerida por el modelo Veredas');
    } else {
      console.log('\n✅ La columna "codigo_vereda" existe');
      console.log(`   Tipo: ${codigoVeredaExists.data_type}`);
      console.log(`   Longitud: ${codigoVeredaExists.character_maximum_length || 'N/A'}`);
      console.log(`   Nullable: ${codigoVeredaExists.is_nullable}`);
    }

    // 5. Comparar con la estructura esperada del modelo
    console.log('\n📋 Estructura esperada según el modelo Veredas:');
    const expectedColumns = [
      { name: 'id_vereda', type: 'BIGINT', required: true },
      { name: 'codigo_vereda', type: 'VARCHAR(50)', required: false },
      { name: 'nombre_vereda', type: 'VARCHAR(255)', required: true },
      { name: 'id_municipio_municipios', type: 'BIGINT', required: true },
      { name: 'id_sector_sector', type: 'BIGINT', required: false },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', required: true },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', required: true }
    ];

    console.table(expectedColumns);

    // 6. Encontrar columnas faltantes
    console.log('\n🔍 Análisis de diferencias:');
    const missingColumns = [];
    const existingColumnNames = currentStructure.rows.map(col => col.column_name);

    expectedColumns.forEach(expected => {
      if (!existingColumnNames.includes(expected.name)) {
        missingColumns.push(expected);
      }
    });

    if (missingColumns.length > 0) {
      console.log('❌ Columnas faltantes:');
      missingColumns.forEach(col => {
        console.log(`   - ${col.name} (${col.type}) ${col.required ? 'REQUERIDA' : 'OPCIONAL'}`);
      });
    } else {
      console.log('✅ Todas las columnas esperadas están presentes');
    }

    // 7. Verificar datos existentes
    console.log('\n📊 Datos existentes en la tabla:');
    const dataCount = await client.query('SELECT COUNT(*) as total FROM veredas');
    console.log(`   Total de registros: ${dataCount.rows[0].total}`);

    if (dataCount.rows[0].total > 0) {
      const sampleData = await client.query('SELECT * FROM veredas LIMIT 3');
      console.log('\n📋 Muestra de datos (primeros 3 registros):');
      console.table(sampleData.rows);
    }

    // 8. Generar script de corrección si es necesario
    if (missingColumns.length > 0) {
      console.log('\n🔧 Script SQL para agregar columnas faltantes:');
      console.log('-- EJECUTAR EN EL SERVIDOR DE BASE DE DATOS --');
      
      missingColumns.forEach(col => {
        let nullable = col.required ? 'NOT NULL' : 'NULL';
        let defaultValue = '';
        
        if (col.name === 'codigo_vereda') {
          defaultValue = '';
          nullable = 'NULL';
        } else if (col.name.includes('created_at') || col.name.includes('updated_at')) {
          defaultValue = ' DEFAULT CURRENT_TIMESTAMP';
          nullable = 'NOT NULL';
        }
        
        console.log(`ALTER TABLE veredas ADD COLUMN ${col.name} ${col.type} ${nullable}${defaultValue};`);
      });
    }

    // 9. Probar consulta del servicio
    console.log('\n🧪 Probando consulta del servicio veredas...');
    try {
      await sequelize.authenticate();
      const veredas = await Veredas.findAll({ limit: 1 });
      console.log('✅ Consulta del modelo Veredas exitosa');
      if (veredas.length > 0) {
        console.log('📋 Estructura del primer registro:');
        console.log(JSON.stringify(veredas[0].toJSON(), null, 2));
      }
    } catch (modelError) {
      console.log('❌ Error en consulta del modelo:', modelError.message);
    }

    await client.end();
    await sequelize.close();
    
    console.log('\n📋 RESUMEN:');
    if (missingColumns.length > 0) {
      console.log('❌ La tabla veredas en el servidor NO está sincronizada');
      console.log('🔧 Soluciones recomendadas:');
      console.log('   1. Ejecutar el script SQL generado arriba');
      console.log('   2. O ejecutar sync de la base de datos en el servidor');
      console.log('   3. Verificar que el modelo Veredas esté actualizado en el servidor');
    } else {
      console.log('✅ La tabla veredas está correctamente sincronizada');
    }

  } catch (error) {
    console.error('❌ Error durante la validación:', error);
    console.error('Detalles:', error.message);
  }
}

// Función adicional para validar específicamente el servicio de veredas
async function testVeredasService() {
  console.log('\n🧪 PROBANDO SERVICIO DE VEREDAS...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión Sequelize establecida');

    // Probar diferentes consultas
    console.log('\n1. 📊 Conteo total:');
    const count = await Veredas.count();
    console.log(`   Total: ${count} veredas`);

    console.log('\n2. 🔍 Consulta básica (LIMIT 2):');
    const basicQuery = await Veredas.findAll({ 
      limit: 2,
      raw: true
    });
    console.table(basicQuery);

    console.log('\n3. 🔍 Consulta con atributos específicos:');
    const specificQuery = await Veredas.findAll({
      attributes: ['id_vereda', 'nombre_vereda', 'codigo_vereda'],
      limit: 2,
      raw: true
    });
    console.table(specificQuery);

    console.log('\n4. 🔍 Descripción del modelo:');
    const description = await Veredas.describe();
    console.table(description);

  } catch (serviceError) {
    console.error('❌ Error en servicio de veredas:', serviceError.message);
    console.error('SQL:', serviceError.sql);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar validación
console.log('🚀 Iniciando validación de estructura de veredas...\n');
validateVeredasStructure()
  .then(() => testVeredasService())
  .catch(console.error);
