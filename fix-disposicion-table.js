import sequelize from './config/sequelize.js';

async function fixDisposicionBasura() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Connected to database');
    
    console.log('🗑️ Dropping tipos_disposicion_basura table...');
    await sequelize.query('DROP TABLE IF EXISTS tipos_disposicion_basura CASCADE;');
    
    console.log('🏗️ Creating tipos_disposicion_basura table with correct schema...');
    await sequelize.query(`
      CREATE TABLE tipos_disposicion_basura (
        id_tipo_disposicion_basura BIGSERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table created successfully');
    
    console.log('🌱 Inserting seed data...');
    await sequelize.query(`
      INSERT INTO tipos_disposicion_basura (nombre, descripcion, created_at, updated_at) 
      VALUES 
        ('Recolección Pública', 'Servicio de recolección municipal', NOW(), NOW()),
        ('Quema', 'Incineración de residuos', NOW(), NOW()),
        ('Entierro', 'Enterramiento de residuos', NOW(), NOW()),
        ('Reciclaje', 'Separación y reciclaje de materiales', NOW(), NOW()),
        ('Compostaje', 'Compostaje de residuos orgánicos', NOW(), NOW()),
        ('Botadero', 'Disposición en botadero', NOW(), NOW()),
        ('Otro', 'Otro método no especificado', NOW(), NOW());
    `);
    
    console.log('✅ Seed data inserted successfully');
    
    console.log('🔍 Verifying table structure...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'tipos_disposicion_basura' 
      ORDER BY ordinal_position;
    `);
    console.table(columns);
    
    const [data] = await sequelize.query('SELECT COUNT(*) as count FROM tipos_disposicion_basura');
    console.log(`📊 Records in table: ${data[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixDisposicionBasura();
