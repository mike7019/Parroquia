import sequelize from './config/sequelize.js';

async function checkUserTableColumns() {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position;
    `;
    
    const [results] = await sequelize.query(query);
    console.log('Current usuarios table structure:');
    console.table(results);
    
    // Check for missing columns
    const requiredColumns = [
      'email_verificado',
      'token_verificacion_email', 
      'fecha_verificacion_email',
      'expira_token_reset'
    ];
    
    const existingColumns = results.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n🔧 Missing columns that need to be added:', missingColumns);
      
      // Add missing columns
      for (const columnName of missingColumns) {
        let alterQuery = '';
        
        switch (columnName) {
          case 'email_verificado':
            alterQuery = `ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT false;`;
            break;
          case 'token_verificacion_email':
            alterQuery = `ALTER TABLE usuarios ADD COLUMN token_verificacion_email VARCHAR(255);`;
            break;
          case 'fecha_verificacion_email':
            alterQuery = `ALTER TABLE usuarios ADD COLUMN fecha_verificacion_email TIMESTAMP WITH TIME ZONE;`;
            break;
          case 'expira_token_reset':
            alterQuery = `ALTER TABLE usuarios ADD COLUMN expira_token_reset TIMESTAMP WITH TIME ZONE;`;
            break;
        }
        
        if (alterQuery) {
          console.log(`Adding column ${columnName}...`);
          await sequelize.query(alterQuery);
          console.log(`✅ Added column: ${columnName}`);
        }
      }
      
      // Verify the changes
      const [updatedResults] = await sequelize.query(query);
      console.log('\n✅ Updated usuarios table structure:');
      console.table(updatedResults);
      
    } else {
      console.log('✅ All required columns exist in the usuarios table');
    }
    
  } catch (error) {
    console.error('❌ Error checking/updating usuarios table:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUserTableColumns();
