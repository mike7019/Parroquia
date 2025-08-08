import sequelize from './config/sequelize.js';

async function checkSexoTable() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Check if sexo table exists and its structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'sexo' 
      ORDER BY ordinal_position
    `);
    
    console.log('Sexo table columns:');
    results.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Try to get some sample data
    try {
      const [sampleData] = await sequelize.query('SELECT * FROM sexo LIMIT 5');
      console.log('\nSample data from sexo table:');
      console.log(sampleData);
    } catch (error) {
      console.log('\nError getting sample data:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSexoTable();
