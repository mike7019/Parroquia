import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkTableStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLAS REMOTAS');
  console.log('🎯 Identificando diferencias en columnas');
  console.log('📅', new Date().toLocaleString());
  console.log('');

  // BD Remota
  const remoteDB = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: '206.62.139.100',
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: { connectTimeout: 30000 }
    }
  );

  // BD Local
  const localDB = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user', 
    process.env.DB_PASSWORD || 'parroquia123',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    console.log('🔄 Conectando a ambas bases de datos...');
    await localDB.authenticate();
    await remoteDB.authenticate();
    console.log('✅ Conexiones establecidas\n');

    // Verificar estructura de parroquias
    console.log('🏗️ ESTRUCTURA DE TABLA PARROQUIAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    console.log('📊 BD Local:');
    const [localColumns] = await localDB.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'parroquias'
      ORDER BY ordinal_position;
    `);
    
    localColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    console.log('\n📊 BD Remota:');
    const [remoteColumns] = await remoteDB.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'parroquias'
      ORDER BY ordinal_position;
    `);
    
    remoteColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // Comparar columnas
    const localColumnNames = localColumns.map(c => c.column_name);
    const remoteColumnNames = remoteColumns.map(c => c.column_name);
    
    const missingInRemote = localColumnNames.filter(c => !remoteColumnNames.includes(c));
    const extraInRemote = remoteColumnNames.filter(c => !localColumnNames.includes(c));
    
    console.log('\n🔍 DIFERENCIAS EN COLUMNAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (missingInRemote.length > 0) {
      console.log(`❌ Columnas faltantes en BD Remota (${missingInRemote.length}):`);
      missingInRemote.forEach(col => console.log(`   - ${col}`));
    }
    
    if (extraInRemote.length > 0) {
      console.log(`➕ Columnas extra en BD Remota (${extraInRemote.length}):`);
      extraInRemote.forEach(col => console.log(`   - ${col}`));
    }

    // Verificar otras tablas problemáticas
    console.log('\n🏗️ ESTRUCTURA DE TABLA FAMILIAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    console.log('📊 BD Local:');
    const [localFamilias] = await localDB.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'familias'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 BD Remota:');
    const [remoteFamilias] = await remoteDB.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'familias'
      ORDER BY ordinal_position;
    `);

    console.log('\nComparando columnas comunes en familias:');
    const commonFamilias = localFamilias.filter(lc => 
      remoteFamilias.some(rc => rc.column_name === lc.column_name)
    );
    
    console.log(`✅ Columnas compatibles: ${commonFamilias.length}`);
    commonFamilias.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    // Verificar personas
    console.log('\n🏗️ ESTRUCTURA DE TABLA PERSONAS:');
    console.log('═══════════════════════════════════════════════════════');
    
    const [localPersonas] = await localDB.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'personas'
      ORDER BY ordinal_position;
    `);
    
    const [remotePersonas] = await remoteDB.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'personas'
      ORDER BY ordinal_position;
    `);

    const commonPersonas = localPersonas.filter(lc => 
      remotePersonas.some(rc => rc.column_name === lc.column_name)
    );
    
    console.log(`✅ Columnas compatibles en personas: ${commonPersonas.length}`);

    console.log('\n💡 RECOMENDACIONES:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Usar solo columnas compatibles en la migración');
    console.log('🔧 Crear script de migración específico para cada tabla');
    console.log('📊 Migrar datos usando solo campos que existen en ambas BD');

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  } finally {
    await localDB.close();
    await remoteDB.close();
    console.log('\n🔒 Conexiones cerradas');
  }
}

// Ejecutar verificación
checkTableStructure().catch(console.error);
