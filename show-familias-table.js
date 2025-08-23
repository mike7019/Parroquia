// Script para mostrar la tabla familias
import sequelize from './config/sequelize.js';

async function showFamiliasTable() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Conectado a la base de datos\n');
    
    // Verificar si existe la tabla familias
    const tables = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%familia%' ORDER BY table_name`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📋 Tablas relacionadas con familias:');
    console.log('Raw tables result:', tables);
    
    // Extraer nombres de tabla correctamente
    const tableNames = tables.map(row => Array.isArray(row) ? row[0] : row.table_name);
    tableNames.forEach(name => console.log('  -', name));
    
    if (tableNames.length === 0) {
      console.log('⚠️ No se encontraron tablas relacionadas con familias');
      console.log('\n🔍 Buscando todas las tablas disponibles...');
      
      const allTables = await sequelize.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('📋 Todas las tablas disponibles:');
      allTables.forEach(table => console.log('  -', table.table_name));
      return;
    }
    
    // Usar la tabla 'familias' si existe
    const tableName = tableNames.find(name => name === 'familias') || tableNames[0];
    
    console.log(`\n🔍 Analizando tabla: ${tableName}`);
    
    // Obtener estructura de la tabla
    const columns = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = '${tableName}' 
       ORDER BY ordinal_position`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📊 Estructura de la tabla:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Obtener count de registros
    const count = await sequelize.query(
      `SELECT COUNT(*) as total FROM ${tableName}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n📈 Total de registros: ${count[0].total}`);
    
    // Mostrar primeros registros
    if (parseInt(count[0].total) > 0) {
      const limit = Math.min(10, parseInt(count[0].total));
      const records = await sequelize.query(
        `SELECT * FROM ${tableName} LIMIT ${limit}`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log(`\n📋 Primeros ${limit} registros:`);
      records.forEach((record, index) => {
        console.log(`\n  Registro ${index + 1}:`);
        Object.keys(record).forEach(key => {
          console.log(`    ${key}: ${record[key]}`);
        });
      });
    } else {
      console.log('\n⚠️ La tabla está vacía');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

showFamiliasTable();
