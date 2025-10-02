import sequelize from './config/sequelize.js';

const checkIds = async () => {
  try {
    const ids = await sequelize.query(`
      SELECT id_sector FROM sectores ORDER BY id_sector LIMIT 10;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('IDs existentes:');
    ids.forEach(r => console.log(` - ${r.id_sector}`));
    
    // Verificar todos los IDs
    const allIds = await sequelize.query(`
      SELECT id_sector FROM sectores ORDER BY id_sector;
    `, { type: sequelize.QueryTypes.SELECT });
    
    const existingNumbers = allIds.map(r => parseInt(r.id_sector));
    console.log('\nTodos los IDs:', existingNumbers);
    
    // Buscar el primer gap
    for (let i = 1; i <= existingNumbers.length + 1; i++) {
      if (!existingNumbers.includes(i)) {
        console.log(`\n✅ Primer ID disponible: ${i}`);
        break;
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkIds();