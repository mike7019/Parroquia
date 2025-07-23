import sequelize from './config/sequelize.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and table structure...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('📋 Database configuration:', {
      database: sequelize.config.database,
      host: sequelize.config.host,
      port: sequelize.config.port,
      username: sequelize.config.username
    });
    
    // Check if users table exists and get its structure
    const [tableExists] = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      )`
    );
    
    console.log('🏗️  Users table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Get table structure
      const [columns] = await sequelize.query(
        `SELECT column_name, data_type, is_nullable, column_default 
         FROM information_schema.columns 
         WHERE table_name = 'users' AND table_schema = 'public'
         ORDER BY ordinal_position`
      );
      
      console.log('📊 Table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check if status column exists specifically
      const statusColumn = columns.find(col => col.column_name === 'status');
      console.log('🎯 Status column:', statusColumn ? 'EXISTS' : 'MISSING');
      
      if (!statusColumn) {
        console.log('❌ Status column is missing! This is the cause of the login error.');
        console.log('💡 Solution: Need to add the status column to the users table.');
      }
      
      // Check existing users
      const [users] = await sequelize.query('SELECT id, email, "isActive" FROM users LIMIT 5');
      console.log('👥 Existing users:', users);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
