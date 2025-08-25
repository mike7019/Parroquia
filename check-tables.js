import 'dotenv/config';
import sequelize from './config/sequelize.js';

console.log('🔍 Checking database tables...');

try {
  // Test if difuntos_familia table exists
  const [results] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('difuntos_familia', 'familias', 'veredas', 'sectores')
    ORDER BY table_name;
  `);
  
  console.log('📋 Found tables:', results.map(r => r.table_name));
  
  // Check if difuntos_familia table has data
  if (results.some(r => r.table_name === 'difuntos_familia')) {
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM difuntos_familia');
    console.log(`📊 difuntos_familia has ${count[0].count} records`);
  } else {
    console.log('❌ difuntos_familia table does not exist');
    console.log('💡 You need to create this table first');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
}
