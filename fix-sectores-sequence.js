import sequelize from './config/sequelize.js';

const fixSequence = async () => {
  try {
    // Obtener el máximo ID
    const maxId = await sequelize.query(`
      SELECT COALESCE(MAX(id_sector), 0) + 1 as next_id FROM sectores;
    `, { type: sequelize.QueryTypes.SELECT });
    
    const nextId = maxId[0].next_id;
    console.log('Próximo ID debe ser:', nextId);
    
    // Corregir la secuencia
    await sequelize.query(`
      SELECT setval('sectores_id_sector_seq', ${nextId});
    `);
    
    console.log('✅ Secuencia corregida');
    
    // Verificar
    const newSeq = await sequelize.query(`
      SELECT last_value FROM sectores_id_sector_seq;
    `, { type: sequelize.QueryTypes.SELECT });
    console.log('Nueva secuencia:', newSeq[0].last_value);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixSequence();