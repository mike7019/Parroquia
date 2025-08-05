import sequelize from './config/sequelize.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando estructura de tablas...');
    
    const tablesToCheck = [
      'tipos_aguas_residuales',
      'destrezas',
      'enfermedades',
      'tipos_disposicion_basura',
      'sistemas_acueducto',
      'profesiones'
    ];
    
    for (const table of tablesToCheck) {
      console.log(`\n📋 === Tabla: ${table} ===`);
      
      // Verificar columnas
      const [results] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log(`📋 Columnas de ${table}:`);
      results.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Verificar primary keys
      const [pkResults] = await sequelize.query(`
        SELECT 
          tc.table_name, 
          kcu.column_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY' 
          AND tc.table_name = '${table}'
          AND tc.table_schema = 'public';
      `);
      
      console.log(`🔑 Primary key de ${table}:`);
      pkResults.forEach(row => {
        console.log(`  - ${row.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
