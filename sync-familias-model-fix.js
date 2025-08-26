import sequelize from './config/sequelize.js';
import Familias from './src/models/catalog/Familias.js';

async function syncFamiliasModel() {
  try {
    console.log('🔄 Synchronizing Familias model with database...');
    
    // Force sync the model (this will recreate the table structure)
    // WARNING: This should only be used in development or with caution
    await Familias.sync({ 
      alter: true,  // Modify existing table to match model
      logging: console.log 
    });
    
    console.log('✅ Familias model synchronized');
    
    // Check if sequence exists and is properly configured
    const [seqExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences 
        WHERE sequence_name = 'familias_id_familia_seq'
      ) as exists
    `);
    
    if (!seqExists[0].exists) {
      console.log('⚠️ Creating missing sequence...');
      await sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS familias_id_familia_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
      `);
      
      // Set ownership of sequence to the column
      await sequelize.query(`
        ALTER SEQUENCE familias_id_familia_seq 
        OWNED BY familias.id_familia;
      `);
      
      // Set default value for the column
      await sequelize.query(`
        ALTER TABLE familias 
        ALTER COLUMN id_familia 
        SET DEFAULT nextval('familias_id_familia_seq'::regclass);
      `);
    }
    
    // Fix sequence value based on existing data
    const [maxIdResult] = await sequelize.query(
      'SELECT COALESCE(MAX(id_familia), 0) as max_id FROM familias'
    );
    const maxId = maxIdResult[0]?.max_id || 0;
    const nextSeqValue = maxId + 1;
    
    await sequelize.query(`SELECT setval('familias_id_familia_seq', ${nextSeqValue}, false)`);
    
    console.log(`✅ Sequence reset to start from ${nextSeqValue}`);
    
    // Verify the model definition
    const tableInfo = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'familias' AND column_name = 'id_familia'
    `);
    
    console.log('📋 Column info:', tableInfo[0][0]);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error syncing Familias model:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncFamiliasModel()
    .then(() => {
      console.log('✅ Model sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Model sync failed:', error);
      process.exit(1);
    });
}

export default syncFamiliasModel;
