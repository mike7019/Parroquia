import sequelize from './config/sequelize.js';

async function correctSequence() {
  try {
    const [maxResult] = await sequelize.query('SELECT MAX(id_familia) as max_id FROM familias');
    const maxId = maxResult[0]?.max_id || 0;
    console.log('Max ID:', maxId);
    
    // Set sequence to correct value (max_id + 1)
    const correctValue = maxId + 1;
    await sequelize.query(`SELECT setval('familias_id_familia_seq', ${correctValue}, false)`);
    console.log('Sequence corrected to:', correctValue);
    
    // Verify
    const [seqResult] = await sequelize.query('SELECT last_value FROM familias_id_familia_seq');
    console.log('Current sequence value:', seqResult[0]?.last_value);
    
    await sequelize.close();
    console.log('✅ Sequence correction completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

correctSequence();
