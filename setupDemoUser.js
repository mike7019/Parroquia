import sequelize from './config/sequelize.js';
import bcrypt from 'bcrypt';

async function setupDemoUser() {
  try {
    console.log('🔍 Checking for demo user...');
    
    // Check if demo user exists
    const [users] = await sequelize.query(`
      SELECT id, email, "emailVerified", status 
      FROM users 
      WHERE email = 'demo@parroquia.com'
    `);
    
    if (users.length === 0) {
      console.log('👤 Creating demo user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('Demo1234!', 12);
      
      // Create the user
      await sequelize.query(`
        INSERT INTO users (
          email, password, "firstName", "lastName", role, status, 
          "isActive", "emailVerified", "createdAt", "updatedAt"
        ) VALUES (
          'demo@parroquia.com', 
          '${hashedPassword}', 
          'Demo', 
          'User', 
          'user', 
          'active', 
          true, 
          true, 
          NOW(), 
          NOW()
        )
      `);
      
      console.log('✅ Demo user created successfully!');
    } else {
      console.log('👤 Demo user already exists:', users[0]);
      
      if (!users[0].emailVerified) {
        console.log('📧 Verifying demo user email...');
        await sequelize.query(`
          UPDATE users 
          SET "emailVerified" = true 
          WHERE email = 'demo@parroquia.com'
        `);
        console.log('✅ Email verified!');
      }
      
      // Update password to make sure it matches
      console.log('🔐 Updating password to ensure it matches...');
      const hashedPassword = await bcrypt.hash('Demo1234!', 12);
      await sequelize.query(`
        UPDATE users 
        SET password = '${hashedPassword}' 
        WHERE email = 'demo@parroquia.com'
      `);
      console.log('✅ Password updated!');
    }
    
    // Verify final state
    const [finalUsers] = await sequelize.query(`
      SELECT id, email, "emailVerified", status, "isActive" 
      FROM users 
      WHERE email = 'demo@parroquia.com'
    `);
    
    console.log('🎯 Final demo user state:', finalUsers[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

setupDemoUser();
