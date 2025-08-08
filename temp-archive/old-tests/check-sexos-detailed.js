import sequelize from './config/sequelize.js';

async function checkSexosTable() {
  try {
    await sequelize.authenticate();
    
    const [columns] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sexos' ORDER BY ordinal_position");
    console.log('sexos table columns:', columns);
    
    const [data] = await sequelize.query('SELECT * FROM sexos LIMIT 3');
    console.log('Sample data:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSexosTable();
