import sequelize from './config/sequelize.js';

console.log('🔍 Quick database check...');

async function quickCheck() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const [result] = await sequelize.query('SELECT version()');
    console.log('Database version:', result[0]?.version);
    
    const [famResult] = await sequelize.query(`
      SELECT COUNT(*) as count, MAX(id_familia) as max_id 
      FROM familias
    `);
    console.log('Familias table stats:', famResult[0]);
    
    await sequelize.close();
    console.log('✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickCheck();
