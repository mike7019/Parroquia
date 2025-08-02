const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(config.development);

async function checkTallas() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND column_name IN ('camisa', 'blusa', 'pantalon', 'calzado')
      ORDER BY column_name
    `);
    
    console.log('👕 Campos de tallas en la tabla personas:');
    if (results.length === 0) {
      console.log('❌ No se encontraron campos de tallas');
    } else {
      results.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // También verificar todos los nuevos campos añadidos
    const [allNewFields] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND column_name IN (
        'camisa', 'blusa', 'pantalon', 'calzado', 
        'estudios', 'en_que_eres_lider', 'habilidad_destreza', 
        'necesidad_enfermo', 'id_profesion'
      )
      ORDER BY column_name
    `);
    
    console.log('\n📝 Todos los nuevos campos añadidos a personas:');
    allNewFields.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTallas();
