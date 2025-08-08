import sequelize from './config/sequelize.js';

async function checkTables() {
  try {
    await sequelize.authenticate();
    
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%sex%'");
    console.log('Tables with sex:', tables);
    
    const [sexoColumns] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sexo'");
    console.log('sexo table columns:', sexoColumns);
    
    const [sexosColumns] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sexos'");
    console.log('sexos table columns:', sexosColumns);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
