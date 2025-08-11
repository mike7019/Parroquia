import sequelize from './config/sequelize.js';

const checkTiposViviendaTable = async () => {
  try {
    console.log('🔍 Checking tipos_vivienda table structure...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if table exists and describe it
    const [results] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'tipos_vivienda' AND table_schema = 'public' ORDER BY ordinal_position"
    );
    
    if (results.length === 0) {
      console.log('❌ Table tipos_vivienda does not exist');
      return;
    }
    
    console.log('\n📋 Table structure for tipos_vivienda:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.forEach(col => {
      console.log(`📌 ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | Null: ${col.is_nullable.padEnd(3)} | Default: ${col.column_default || 'NULL'}`);
    });
    
    // Test a simple query
    console.log('\n🧪 Testing simple query...');
    const [testResults] = await sequelize.query("SELECT COUNT(*) as total FROM tipos_vivienda");
    console.log(`✅ Query successful. Found ${testResults[0].total} records`);
    
    // Test sorting by nombre
    console.log('\n🧪 Testing sort by nombre...');
    try {
      const [sortResults] = await sequelize.query("SELECT id_tipo_vivienda, nombre FROM tipos_vivienda ORDER BY nombre ASC LIMIT 5");
      console.log('✅ Sort by nombre successful:');
      sortResults.forEach(row => {
        console.log(`   - ID: ${row.id_tipo_vivienda}, Nombre: ${row.nombre}`);
      });
    } catch (sortError) {
      console.log('❌ Sort by nombre failed:', sortError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

checkTiposViviendaTable();
