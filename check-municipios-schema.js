import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME || 'parroquia_db', process.env.DB_USER || 'parroquia_user', process.env.DB_PASSWORD || '123456', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkSchema() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, is_nullable, column_default, data_type
      FROM information_schema.columns 
      WHERE table_name = 'municipios' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla municipios:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default || 'N/A'}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();
