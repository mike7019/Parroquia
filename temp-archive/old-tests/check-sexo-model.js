import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

async function checkSexoModel() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Load all models
    await loadAllModels();
    
    console.log('Available models:', Object.keys(sequelize.models));
    
    // Check if Sexo model is available
    if (sequelize.models.Sexo) {
      console.log('Sexo model found');
      console.log('Table name:', sequelize.models.Sexo.tableName);
      console.log('Attributes:', Object.keys(sequelize.models.Sexo.rawAttributes));
      console.log('Timestamps:', sequelize.models.Sexo.options.timestamps);
      
      // Try to count records
      try {
        const count = await sequelize.models.Sexo.count();
        console.log('Records in Sexo table:', count);
      } catch (error) {
        console.error('Error counting records:', error.message);
      }
    } else {
      console.log('Sexo model not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSexoModel();
