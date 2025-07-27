import sequelize from './config/sequelize.js';

async function verifyUser() {
  try {
    console.log('🔧 Verificando usuario...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Update the user to be verified
    const [results] = await sequelize.query(`
      UPDATE users 
      SET "emailVerified" = true 
      WHERE email = 'coordinator@example.com'
      RETURNING *
    `);
    
    if (results.length > 0) {
      console.log('✅ Usuario verificado exitosamente');
      console.log('📧 Email:', results[0].email);
      console.log('👤 Nombre:', results[0].firstName, results[0].lastName);
      console.log('🎭 Rol:', results[0].role);
    } else {
      console.log('❌ No se encontró el usuario');
    }
    
    // Close connection
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
