import 'dotenv/config';
import sequelize from './config/sequelize.js';

console.log('🔧 Updating parroquia table structure...');

try {
  // Add missing columns
  const columns = [
    { name: 'descripcion', type: 'TEXT' },
    { name: 'direccion', type: 'VARCHAR(500)' },
    { name: 'telefono', type: 'VARCHAR(20)' },
    { name: 'email', type: 'VARCHAR(100)' },
    { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
  ];

  for (const col of columns) {
    try {
      console.log(`📝 Adding column: ${col.name}`);
      await sequelize.query(`
        ALTER TABLE parroquia 
        ADD COLUMN ${col.name} ${col.type};
      `);
      console.log(`✅ Added ${col.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⏭️  Column ${col.name} already exists`);
      } else {
        console.log(`❌ Error adding ${col.name}: ${error.message}`);
      }
    }
  }
  
  console.log('✅ Parroquia table structure updated');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
}
