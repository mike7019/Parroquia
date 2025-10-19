/**
 * Diagnóstico de Tabla tipos_disposicion_basura
 * Verifica estructura y datos
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: console.log
});

async function diagnosticoDisposicionBasura() {
  try {
    console.log('🔍 DIAGNÓSTICO DE tipos_disposicion_basura');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // 1. Verificar si la tabla existe
    console.log('1️⃣ VERIFICANDO SI LA TABLA EXISTE:\n');
    const [tablaExiste] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tipos_disposicion_basura'
      );
    `);
    
    if (!tablaExiste[0].exists) {
      console.log('❌ LA TABLA NO EXISTE\n');
      await sequelize.close();
      return;
    }
    
    console.log('✅ La tabla existe\n');

    // 2. Verificar estructura
    console.log('2️⃣ ESTRUCTURA DE LA TABLA:\n');
    const [estructura] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'tipos_disposicion_basura'
      ORDER BY ordinal_position;
    `);

    console.log('Columnas:');
    estructura.forEach(col => {
      console.log(`  ${col.column_name.padEnd(35)} ${col.data_type.padEnd(25)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'.padEnd(8)} ${col.column_default || ''}`);
    });

    // 3. Verificar datos
    console.log('\n3️⃣ DATOS EN LA TABLA:\n');
    const [datos] = await sequelize.query(`
      SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura;
    `);

    if (datos.length === 0) {
      console.log('⚠️  LA TABLA ESTÁ VACÍA\n');
    } else {
      console.log(`Total de registros: ${datos.length}\n`);
      datos.forEach(row => {
        console.log(`  ID ${row.id_tipo_disposicion_basura}: ${row.nombre}`);
        if (row.descripcion) {
          console.log(`     Descripción: ${row.descripcion}`);
        }
      });
    }

    // 4. Intentar consultar el ID 5 específicamente
    console.log('\n4️⃣ VERIFICANDO ID 5 (del error):\n');
    const [id5] = await sequelize.query(`
      SELECT * FROM tipos_disposicion_basura WHERE id_tipo_disposicion_basura = 5;
    `);

    if (id5.length === 0) {
      console.log('❌ NO EXISTE REGISTRO CON ID 5');
      console.log('   Este es el problema: El frontend está intentando acceder al ID 5 pero no existe.\n');
    } else {
      console.log('✅ Registro con ID 5 encontrado:');
      console.log(JSON.stringify(id5[0], null, 2));
    }

    // 5. Verificar secuencia
    console.log('\n5️⃣ VERIFICANDO SECUENCIA:\n');
    const [secuencia] = await sequelize.query(`
      SELECT last_value, is_called 
      FROM tipos_disposicion_basura_id_tipo_disposicion_basura_seq;
    `);
    
    console.log(`  Last value: ${secuencia[0].last_value}`);
    console.log(`  Is called: ${secuencia[0].is_called}`);

    // 6. Verificar índices y constraints
    console.log('\n6️⃣ VERIFICANDO ÍNDICES Y CONSTRAINTS:\n');
    const [constraints] = await sequelize.query(`
      SELECT
        conname AS constraint_name,
        contype AS constraint_type
      FROM pg_constraint
      WHERE conrelid = 'tipos_disposicion_basura'::regclass;
    `);

    if (constraints.length > 0) {
      constraints.forEach(c => {
        const tipo = c.constraint_type === 'p' ? 'PRIMARY KEY' : 
                     c.constraint_type === 'f' ? 'FOREIGN KEY' :
                     c.constraint_type === 'u' ? 'UNIQUE' : c.constraint_type;
        console.log(`  ${c.constraint_name}: ${tipo}`);
      });
    } else {
      console.log('  Sin constraints');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNÓSTICO COMPLETADO\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

diagnosticoDisposicionBasura();
