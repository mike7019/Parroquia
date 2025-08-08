import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Load all models
    await loadAllModels();
    
    // Check if we have users
    const [users] = await sequelize.query('SELECT id, correo_electronico FROM usuarios LIMIT 5');
    console.log('Existing users:', users);
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      // Create a test user directly in the database
      const [result] = await sequelize.query(`
        INSERT INTO usuarios (id, correo_electronico, contrasena_hash, primer_nombre, primer_apellido, activo) 
        VALUES (
          gen_random_uuid(), 
          'admin@test.com', 
          '$2b$10$example.hash.for.password.admin123', 
          'Admin', 
          'Test', 
          true
        ) 
        RETURNING id, correo_electronico
      `);
      console.log('Created user:', result);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
