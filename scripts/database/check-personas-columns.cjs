const { QueryInterface, Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  config.development
);

async function checkColumns() {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `;
    
    const [results] = await sequelize.query(query);
    
    console.log('\n=== Columnas en la tabla personas ===');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name}`);
    });
    
    // Verificar específicamente si existe habilidad_destreza
    const hasHabilidadDestreza = results.some(row => row.column_name === 'habilidad_destreza');
    console.log(`\n¿Existe el campo 'habilidad_destreza'? ${hasHabilidadDestreza ? 'SÍ' : 'NO'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
