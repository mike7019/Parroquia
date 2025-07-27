import sequelize from './config/sequelize.js';

async function checkColumns() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    results.forEach(r => console.log('-', r.column_name));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkColumns();
