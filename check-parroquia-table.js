import sequelize from './config/sequelize.js';

const checkParroquiaTable = async () => {
  try {
    console.log('🔍 Checking parroquia table structure...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if table exists and describe it
    const [results] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'parroquia' AND table_schema = 'public' ORDER BY ordinal_position"
    );
    
    if (results.length === 0) {
      console.log('❌ Table parroquia does not exist');
      return;
    }
    
    console.log('\n📋 Table structure for parroquia:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.forEach(col => {
      console.log(`📌 ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | Null: ${col.is_nullable.padEnd(3)} | Default: ${col.column_default || 'NULL'}`);
    });
    
    // Test a simple insert to see what happens
    console.log('\n🧪 Testing simple insert...');
    try {
      const testData = {
        nombre: 'Test Parroquia',
        id_municipio: 1,
        descripcion: 'Test description'
      };
      
      // First check if municipio 1 exists
      const [municipioCheck] = await sequelize.query("SELECT id_municipio FROM municipios WHERE id_municipio = 1 LIMIT 1");
      
      if (municipioCheck.length === 0) {
        console.log('⚠️  Municipio with ID 1 does not exist, using any existing municipio...');
        const [anyMunicipio] = await sequelize.query("SELECT id_municipio FROM municipios LIMIT 1");
        if (anyMunicipio.length > 0) {
          testData.id_municipio = anyMunicipio[0].id_municipio;
          console.log(`ℹ️  Using municipio ID: ${testData.id_municipio}`);
        } else {
          console.log('❌ No municipios found in database');
          return;
        }
      }
      
      // Try direct SQL insert to see the exact error
      const insertSQL = `
        INSERT INTO parroquia (nombre, id_municipio, descripcion) 
        VALUES ('${testData.nombre}', ${testData.id_municipio}, '${testData.descripcion}')
        RETURNING id_parroquia, nombre, created_at, updated_at
      `;
      
      console.log('SQL to execute:', insertSQL);
      const [insertResult] = await sequelize.query(insertSQL);
      console.log('✅ Direct SQL insert successful:', insertResult[0]);
      
      // Clean up the test record
      await sequelize.query(`DELETE FROM parroquia WHERE nombre = '${testData.nombre}'`);
      console.log('🧹 Test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      if (insertError.original) {
        console.log('Original error:', insertError.original.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

checkParroquiaTable();
