import sequelize from './config/sequelize.js';
import Familias from './src/models/catalog/Familias.js';

async function fixFamiliasSequence() {
  try {
    console.log('🔍 Checking familias table and sequence...');
    
    // 1. Get current max ID from familias table
    const [maxIdResult] = await sequelize.query(
      'SELECT COALESCE(MAX(id_familia), 0) as max_id FROM familias'
    );
    const maxId = maxIdResult[0]?.max_id || 0;
    console.log(`📊 Current max ID in familias table: ${maxId}`);
    
    // 2. Get current sequence value
    const [seqResult] = await sequelize.query(
      'SELECT last_value, is_called FROM familias_id_familia_seq'
    );
    const currentSeqValue = seqResult[0]?.last_value || 0;
    const isCalled = seqResult[0]?.is_called || false;
    console.log(`🔢 Current sequence value: ${currentSeqValue}, is_called: ${isCalled}`);
    
    // 3. Calculate next sequence value
    const nextSeqValue = Math.max(maxId + 1, 1);
    console.log(`➡️ Setting sequence to: ${nextSeqValue}`);
    
    // 4. Fix the sequence
    await sequelize.query(`SELECT setval('familias_id_familia_seq', ${nextSeqValue}, false)`);
    
    // 5. Verify the fix
    const [verifyResult] = await sequelize.query(
      'SELECT last_value, is_called FROM familias_id_familia_seq'
    );
    console.log(`✅ Sequence fixed. New value: ${verifyResult[0]?.last_value}, is_called: ${verifyResult[0]?.is_called}`);
    
    // 6. Test creating a record (dry run with rollback)
    const transaction = await sequelize.transaction();
    try {
      console.log('🧪 Testing familia creation...');
      const testFamilia = await Familias.create({
        apellido_familiar: 'Test Family',
        sector: 'Test Sector',
        direccion_familia: 'Test Address',
        tamaño_familia: 1,
        tipo_vivienda: 'Casa',
        estado_encuesta: 'pending',
        numero_encuestas: 0,
        id_municipio: 1,
        id_vereda: 1,
        id_sector: 1
      }, { transaction });
      
      console.log(`✅ Test successful! Generated ID: ${testFamilia.id_familia}`);
      
      // Rollback the test
      await transaction.rollback();
      console.log('🔄 Test transaction rolled back');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Test failed:', error.message);
      throw error;
    }
    
    console.log('🎉 Familias sequence has been fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing familias sequence:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixFamiliasSequence()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default fixFamiliasSequence;
