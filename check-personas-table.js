import sequelize from './config/sequelize.js';

async function checkPersonasTable() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Personas table columns:');
    results.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPersonasTable();
