import sequelize from './config/sequelize.js';

async function addTimestampsToParroquia() {
  try {
    console.log('🔄 Agregando campos de timestamp a la tabla parroquia...');
    
    // Agregar created_at con valor por defecto para registros existentes
    await sequelize.query(`
      ALTER TABLE parroquia 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
    
    // Agregar updated_at con valor por defecto para registros existentes
    await sequelize.query(`
      ALTER TABLE parroquia 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
    
    console.log('✅ Campos de timestamp agregados exitosamente');
    
    // Verificar la estructura final
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' AND table_schema = 'public'
      AND column_name IN ('created_at', 'updated_at')
      ORDER BY column_name
    `);
    
    console.log('📊 Campos de timestamp agregados:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) (default: ${col.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Error al agregar timestamps:', error);
  } finally {
    await sequelize.close();
  }
}

addTimestampsToParroquia();
