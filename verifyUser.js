import sequelize from './config/sequelize.js';

async function verifyUserEmail() {
  try {
    console.log('🔄 Manually verifying user email for testing...');
    
    // Update the user to be verified
    const [updated] = await sequelize.query(`
      UPDATE users 
      SET "emailVerified" = true, 
          "emailVerificationToken" = null 
      WHERE email = 'juan.perez@example.com'
    `);
    
    console.log('✅ User email verified successfully');
    
    // Check the user's status
    const [users] = await sequelize.query(`
      SELECT id, email, "emailVerified", status, "isActive" 
      FROM users 
      WHERE email = 'juan.perez@example.com'
    `);
    
    console.log('👤 User details:', users[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyUserEmail();
