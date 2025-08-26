import sequelize from './config/sequelize.js';

// Add this function to run after model sync
async function ensureSequenceSync(modelName, tableName, idColumn = 'id') {
  try {
    const sequenceName = `${tableName}_${idColumn}_seq`;
    
    // Get max ID from table
    const [maxResult] = await sequelize.query(
      `SELECT COALESCE(MAX(${idColumn}), 0) as max_id FROM ${tableName}`
    );
    const maxId = maxResult[0]?.max_id || 0;
    
    // Reset sequence to correct value
    await sequelize.query(
      `SELECT setval('${sequenceName}', ${maxId + 1}, false)`
    );
    
    console.log(`✅ ${modelName} sequence synchronized (next: ${maxId + 1})`);
  } catch (error) {
    console.error(`❌ Failed to sync ${modelName} sequence:`, error.message);
  }
}

// Call this after your models are loaded
export async function syncAllSequences() {
  await ensureSequenceSync('Familias', 'familias', 'id_familia');
  // Add other models as needed
  // await ensureSequenceSync('Personas', 'personas', 'id_persona');
}

export default ensureSequenceSync;
