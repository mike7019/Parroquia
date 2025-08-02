const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(config.development);

async function showAllPersonasColumns() {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        ordinal_position,
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 TODOS los campos en la tabla personas:');
    console.log('═'.repeat(80));
    
    results.forEach((col, index) => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      
      console.log(`${String(col.ordinal_position).padStart(2, ' ')}. ${col.column_name.padEnd(35, ' ')} ${col.data_type}${length} ${nullable}${defaultVal}`);
    });
    
    console.log('═'.repeat(80));
    console.log(`Total de campos: ${results.length}`);
    
    // Verificar específicamente los campos nuevos
    const newFields = results.filter(col => 
      ['camisa', 'blusa', 'pantalon', 'calzado', 'estudios', 'en_que_eres_lider', 'habilidad_destreza', 'necesidad_enfermo', 'id_profesion'].includes(col.column_name)
    );
    
    console.log('\n🆕 Campos nuevos añadidos:');
    newFields.forEach(col => {
      console.log(`✅ ${col.column_name} (posición ${col.ordinal_position})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

showAllPersonasColumns();
