import sequelize from './config/sequelize.js';

const addActivoColumn = async () => {
  try {
    console.log('🔍 Adding activo column to tipos_vivienda table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if activo column already exists
    const [columns] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'tipos_vivienda' AND column_name = 'activo'"
    );
    
    if (columns.length > 0) {
      console.log('ℹ️  Column activo already exists');
      return;
    }
    
    // Add the activo column
    console.log('📝 Adding activo column...');
    await sequelize.query(
      "ALTER TABLE tipos_vivienda ADD COLUMN activo BOOLEAN NOT NULL DEFAULT true"
    );
    
    console.log('✅ Column activo added successfully');
    
    // Verify the column was added
    const [newColumns] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'tipos_vivienda' ORDER BY ordinal_position"
    );
    
    console.log('\n📋 Updated table structure:');
    newColumns.forEach(col => console.log('- ' + col.column_name));
    
    // Test the column with a simple query
    console.log('\n🧪 Testing activo column...');
    const [testResults] = await sequelize.query("SELECT id_tipo_vivienda, nombre, activo FROM tipos_vivienda LIMIT 3");
    console.log('✅ Column test successful:');
    testResults.forEach(row => {
      console.log(`   - ID: ${row.id_tipo_vivienda}, Nombre: ${row.nombre}, Activo: ${row.activo}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

addActivoColumn();
