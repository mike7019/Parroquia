import sequelize from './config/sequelize.js';
import Familias from './src/models/catalog/Familias.js';

async function createFamiliasSequence() {
  try {
    console.log('🔍 Checking familias table structure and creating sequence...');
    
    // 1. Get current max ID from familias table
    const [maxIdResult] = await sequelize.query(
      'SELECT COALESCE(MAX(id_familia), 0) as max_id FROM familias'
    );
    const maxId = maxIdResult[0]?.max_id || 0;
    console.log(`📊 Current max ID in familias table: ${maxId}`);
    
    // 2. Check if sequence exists
    const [seqCheckResult] = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences 
        WHERE sequence_name = 'familias_id_familia_seq'
      ) as exists
    `);
    
    const sequenceExists = seqCheckResult[0]?.exists || false;
    console.log(`🔍 Sequence exists: ${sequenceExists}`);
    
    if (!sequenceExists) {
      console.log('🚧 Creating familias_id_familia_seq sequence...');
      
      // 3. Create the sequence
      await sequelize.query(`
        CREATE SEQUENCE familias_id_familia_seq
        START WITH ${maxId + 1}
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
      `);
      console.log('✅ Sequence created');
      
      // 4. Set sequence ownership to the column
      await sequelize.query(`
        ALTER SEQUENCE familias_id_familia_seq 
        OWNED BY familias.id_familia;
      `);
      console.log('✅ Sequence ownership set');
      
      // 5. Update column default to use the sequence
      await sequelize.query(`
        ALTER TABLE familias 
        ALTER COLUMN id_familia 
        SET DEFAULT nextval('familias_id_familia_seq'::regclass);
      `);
      console.log('✅ Column default set to use sequence');
      
    } else {
      console.log('⚠️ Sequence already exists, fixing its value...');
      
      // Fix existing sequence value
      await sequelize.query(`SELECT setval('familias_id_familia_seq', ${maxId + 1}, false)`);
      console.log('✅ Sequence value fixed');
    }
    
    // 6. Verify the sequence setup
    const [verifyResult] = await sequelize.query(
      'SELECT last_value, is_called FROM familias_id_familia_seq'
    );
    console.log(`✅ Sequence status: value=${verifyResult[0]?.last_value}, is_called=${verifyResult[0]?.is_called}`);
    
    // 7. Check column default
    const [columnInfo] = await sequelize.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'familias' AND column_name = 'id_familia'
    `);
    console.log(`📋 Column default: ${columnInfo[0]?.column_default}`);
    
    // 8. Test creating a record (dry run with rollback)
    const transaction = await sequelize.transaction();
    try {
      console.log('🧪 Testing familia creation...');
      const testFamilia = await Familias.create({
        apellido_familiar: 'Test Family Sequence',
        sector: 'Test Sector',
        direccion_familia: 'Test Address 123',
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
      
      // Try to diagnose the issue
      console.log('🔍 Diagnosing issue...');
      const [tableStructure] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'familias'
        ORDER BY ordinal_position;
      `);
      console.log('📋 Table structure:', tableStructure);
      
      throw error;
    }
    
    console.log('🎉 Familias sequence has been created/fixed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Test creating a familia through your API');
    console.log('   2. The sequence should now auto-generate IDs');
    
  } catch (error) {
    console.error('❌ Error creating/fixing familias sequence:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createFamiliasSequence()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default createFamiliasSequence;
