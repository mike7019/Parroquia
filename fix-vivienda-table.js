import sequelize from './config/sequelize.js';

async function fixTipoViviendas() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Connected to database');
    
    // Check if we need to fix tipos_vivienda table name
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%vivienda%';
    `);
    
    console.log('🔍 Tables related to vivienda:');
    console.table(tables);
    
    const hasOldTable = tables.some(t => t.table_name === 'tipo_viviendas');
    const hasNewTable = tables.some(t => t.table_name === 'tipos_vivienda');
    
    if (hasOldTable && !hasNewTable) {
      console.log('🔄 Renaming tipo_viviendas to tipos_vivienda...');
      await sequelize.query('ALTER TABLE tipo_viviendas RENAME TO tipos_vivienda;');
      console.log('✅ Table renamed successfully');
    } else if (!hasNewTable) {
      console.log('🏗️ Creating tipos_vivienda table...');
      await sequelize.query(`
        CREATE TABLE tipos_vivienda (
          id_tipo_vivienda BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('🌱 Inserting seed data...');
      await sequelize.query(`
        INSERT INTO tipos_vivienda (nombre, descripcion, created_at, updated_at) 
        VALUES 
          ('Casa', 'Vivienda unifamiliar independiente', NOW(), NOW()),
          ('Apartamento', 'Vivienda en edificio multifamiliar', NOW(), NOW()),
          ('Finca', 'Vivienda rural de construcción tradicional', NOW(), NOW()),
          ('Rancho', 'Vivienda en propiedad rural', NOW(), NOW()),
          ('Cuarto', 'Habitación en casa o edificio compartido', NOW(), NOW()),
          ('Otro', 'Otro tipo de vivienda no especificado', NOW(), NOW());
      `);
      console.log('✅ Table created and populated');
    } else {
      console.log('ℹ️ tipos_vivienda table already exists correctly');
    }
    
    // Check final status
    const [finalData] = await sequelize.query('SELECT COUNT(*) as count FROM tipos_vivienda');
    console.log(`📊 Records in tipos_vivienda table: ${finalData[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixTipoViviendas();
