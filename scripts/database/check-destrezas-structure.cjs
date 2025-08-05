const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  config.development
);

async function checkDestrezasStructure() {
  try {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'destrezas' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `;
    
    const [results] = await sequelize.query(query);
    
    console.log('=== Estructura de la tabla destrezas ===');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable} - Default: ${row.column_default || 'N/A'}`);
    });
    
    // También verificar la tabla persona_destreza
    console.log('\n=== Estructura de la tabla persona_destreza ===');
    const query2 = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'persona_destreza' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `;
    
    const [results2] = await sequelize.query(query2);
    results2.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable} - Default: ${row.column_default || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDestrezasStructure();
