import sequelize from './config/sequelize.js';

async function listarDestrezas() {
  try {
    const [destrezas] = await sequelize.query(
      'SELECT id_destreza, nombre FROM destrezas ORDER BY id_destreza'
    );
    
    console.log('📋 Destrezas disponibles:\n');
    destrezas.forEach(d => {
      console.log(`  ${d.id_destreza}: ${d.nombre}`);
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listarDestrezas();
