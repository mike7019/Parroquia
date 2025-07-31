// Database Integration Test Script
import sequelize from './config/sequelize.js';
import Sexo from './src/models/catalog/Sexo.js';
import Parroquia from './src/models/catalog/Parroquia.js';
import Familias from './src/models/catalog/Familias.js';

async function testDatabaseIntegration() {
  console.log('🔍 Testing Database Integration...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Check timestamp columns exist
    console.log('2️⃣ Verifying timestamp columns...');
    const [timestampResults] = await sequelize.query(`
      SELECT 
        table_name, 
        COUNT(column_name) as timestamp_columns
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name IN ('createdAt', 'updatedAt')
        AND table_name NOT IN ('SequelizeMeta', 'pg_stat_statements', 'pg_stat_statements_info')
      GROUP BY table_name
      HAVING COUNT(column_name) = 2
      ORDER BY table_name;
    `);
    console.log(`✅ ${timestampResults.length} tables have proper timestamp columns\n`);
    
    // Test 3: Sample data verification
    console.log('3️⃣ Testing catalog data access...');
    
    const sexoCount = await Sexo.count();
    console.log(`📊 Sexo records: ${sexoCount}`);
    
    if (sexoCount > 0) {
      const sexoSample = await Sexo.findAll({ limit: 3 });
      console.log('Sample sexo data:', sexoSample.map(s => ({ id: s.id_sexo, descripcion: s.descripcion })));
    }
    
    const parroquiaCount = await Parroquia.count();
    console.log(`📊 Parroquia records: ${parroquiaCount}`);
    
    const familiaCount = await Familias.count();
    console.log(`📊 Familia records: ${familiaCount}\n`);
    
    // Test 4: Test CRUD operations
    console.log('4️⃣ Testing CRUD operations...');
    
    // Create test record
    const testFamilia = await Familias.create({
      uuid_familia: 'test-' + Date.now(),
      nombre_familia: 'Test Family ' + Date.now(),
      direccion_familia: '123 Test Street',
      numero_contrato_epm: 'TEST-' + Date.now(),
      tratamiento_datos: true,
      observaciones: 'Test record created by integration test'
    });
    console.log(`✅ Created test familia with ID: ${testFamilia.id_familia}`);
    
    // Read test record
    const readFamilia = await Familias.findByPk(testFamilia.id_familia);
    console.log(`✅ Read test familia: ${readFamilia.nombre_familia}`);
    
    // Update test record
    await readFamilia.update({
      observaciones: 'Updated by integration test at ' + new Date().toISOString()
    });
    console.log(`✅ Updated test familia observations`);
    
    // Verify timestamps are working
    console.log(`🕐 Created: ${readFamilia.createdAt}`);
    console.log(`🕐 Updated: ${readFamilia.updatedAt}`);
    
    // Delete test record
    await readFamilia.destroy();
    console.log(`✅ Deleted test familia\n`);
    
    // Test 5: Complex query with joins
    console.log('5️⃣ Testing complex queries...');
    const [complexResults] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id_personas) as total_personas,
        COUNT(DISTINCT f.id_familia) as total_familias,
        COUNT(DISTINCT v.id_vereda) as total_veredas
      FROM personas p 
      LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
      LEFT JOIN veredas v ON f.id_vereda_veredas = v.id_vereda;
    `);
    console.log('📊 Database statistics:', complexResults[0]);
    
    // Test 6: Migration verification
    console.log('\n6️⃣ Verifying migration status...');
    const [migrationResults] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" ORDER BY name;
    `);
    console.log(`✅ Executed migrations: ${migrationResults.length}`);
    migrationResults.forEach(m => console.log(`  - ${m.name}`));
    
    console.log('\n🎉 All database integration tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Database connection: Working`);
    console.log(`   ✅ Timestamp columns: ${timestampResults.length} tables`);
    console.log(`   ✅ Data access: Working`);
    console.log(`   ✅ CRUD operations: Working`);
    console.log(`   ✅ Complex queries: Working`);
    console.log(`   ✅ Migration tracking: Working`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Run the test
testDatabaseIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
