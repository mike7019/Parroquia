require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');

async function debugDatabase() {
  console.log('🔍 DIAGNÓSTICO DE BASE DE DATOS');
  console.log('═══════════════════════════════════');
  
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  });

  try {
    // 1. Verificar conexión
    console.log('\n1️⃣ Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión DB exitosa');

    // 2. Listar tablas
    console.log('\n2️⃣ Listando tablas disponibles...');
    const [tables] = await sequelize.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log(`📊 Tablas encontradas: ${tables.length}`);
    tables.forEach(t => console.log(`  - ${t.tablename}`));

    // 3. Verificar tabla personas
    console.log('\n3️⃣ Verificando estructura de tabla personas...');
    const [personasColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      ORDER BY ordinal_position
    `);
    console.log(`📊 Columnas en personas: ${personasColumns.length}`);
    personasColumns.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
    });

    // 4. Verificar tabla familias
    console.log('\n4️⃣ Verificando estructura de tabla familias...');
    const [familiasColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position
    `);
    console.log(`📊 Columnas en familias: ${familiasColumns.length}`);
    familiasColumns.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
    });

    // 5. Verificar transacciones activas
    console.log('\n5️⃣ Verificando transacciones activas...');
    const [activeTransactions] = await sequelize.query(`
      SELECT 
        pid,
        state,
        application_name,
        backend_start,
        query_start,
        state_change,
        query
      FROM pg_stat_activity 
      WHERE state = 'active' 
      AND application_name LIKE '%nodejs%'
    `);
    console.log(`📊 Transacciones activas: ${activeTransactions.length}`);
    activeTransactions.forEach(t => {
      console.log(`  - PID: ${t.pid}, Estado: ${t.state}, Query: ${t.query?.substring(0, 100)}...`);
    });

    // 6. Probar una transacción simple
    console.log('\n6️⃣ Probando transacción simple...');
    const transaction = await sequelize.transaction();
    try {
      console.log('  🔄 Transacción iniciada');
      
      // Hacer una consulta simple en la transacción
      const [result] = await sequelize.query('SELECT COUNT(*) as total FROM familias', {
        transaction,
        type: QueryTypes.SELECT
      });
      console.log(`  📊 Total familias: ${result.total}`);
      
      await transaction.commit();
      console.log('  ✅ Transacción confirmada exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.log(`  ❌ Error en transacción: ${error.message}`);
      throw error;
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETADO - Todo OK');

  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

debugDatabase();
