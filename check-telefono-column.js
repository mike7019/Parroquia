import sequelize from './config/sequelize.js';

async function checkTelefonoColumn() {
  try {
    const query = `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'telefono';
    `;
    
    const [results] = await sequelize.query(query);
    console.log('Current telefono column structure:', results);
    
    if (results.length > 0 && results[0].character_maximum_length < 20) {
      console.log('\n🔧 Need to update telefono column from VARCHAR(15) to VARCHAR(20)');
      
      const updateQuery = `ALTER TABLE usuarios ALTER COLUMN telefono TYPE VARCHAR(20);`;
      await sequelize.query(updateQuery);
      console.log('✅ Successfully updated telefono column to VARCHAR(20)');
      
      // Verify the change
      const [verifyResults] = await sequelize.query(query);
      console.log('Updated telefono column structure:', verifyResults);
    } else {
      console.log('✅ Telefono column is already properly configured');
    }
    
  } catch (error) {
    console.error('❌ Error checking/updating telefono column:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTelefonoColumn();
