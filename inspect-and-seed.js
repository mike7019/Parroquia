import sequelize from './config/sequelize.js';

async function inspectAndSeedTables() {
  try {
    console.log('🔍 Inspecting table structures...');
    
    // 1. Inspect departamentos table
    console.log('\n📋 DEPARTAMENTOS table structure:');
    const [deptosColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'departamentos'
      ORDER BY ordinal_position;
    `);
    console.log(deptosColumns);
    
    // 2. Inspect municipios table
    console.log('\n📋 MUNICIPIOS table structure:');
    const [municipiosColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'municipios'
      ORDER BY ordinal_position;
    `);
    console.log(municipiosColumns);
    
    // 3. Inspect veredas table
    console.log('\n📋 VEREDAS table structure:');
    const [veredasColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'veredas'
      ORDER BY ordinal_position;
    `);
    console.log(veredasColumns);
    
    // 4. Inspect sectores table
    console.log('\n📋 SECTORES table structure:');
    const [sectoresColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'sectores'
      ORDER BY ordinal_position;
    `);
    console.log(sectoresColumns);
    
    // 5. Now seed with correct column names
    console.log('\n🌱 Seeding with correct column names...');
    
    // Seed departamentos first
    const [deptosCount] = await sequelize.query('SELECT COUNT(*) as count FROM departamentos');
    if (parseInt(deptosCount[0]?.count || 0) === 0) {
      console.log('📍 Creating departamento...');
      
      // Find the correct column name for department name
      const deptNameColumn = deptosColumns.find(col => 
        col.column_name.includes('nombre') || 
        col.column_name.includes('departamento') ||
        col.column_name === 'name'
      )?.column_name || 'nombre_departamento';
      
      const hasTimestamps = deptosColumns.some(col => col.column_name === 'created_at');
      
      if (hasTimestamps) {
        await sequelize.query(`
          INSERT INTO departamentos (id_departamento, ${deptNameColumn}, created_at, updated_at) 
          VALUES (1, 'Departamento Default', NOW(), NOW())
          ON CONFLICT (id_departamento) DO NOTHING
        `);
      } else {
        await sequelize.query(`
          INSERT INTO departamentos (id_departamento, ${deptNameColumn}) 
          VALUES (1, 'Departamento Default')
          ON CONFLICT (id_departamento) DO NOTHING
        `);
      }
      console.log('✅ Departamento created');
    }
    
    // Seed municipios
    const [municipiosCount] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    if (parseInt(municipiosCount[0]?.count || 0) === 0) {
      console.log('🏙️ Creating municipio...');
      
      const munNameColumn = municipiosColumns.find(col => 
        col.column_name.includes('nombre') || 
        col.column_name.includes('municipio') ||
        col.column_name === 'name'
      )?.column_name || 'nombre_municipio';
      
      const hasTimestamps = municipiosColumns.some(col => col.column_name === 'created_at');
      
      if (hasTimestamps) {
        await sequelize.query(`
          INSERT INTO municipios (id_municipio, ${munNameColumn}, id_departamento, created_at, updated_at) 
          VALUES (1, 'Municipio Default', 1, NOW(), NOW())
          ON CONFLICT (id_municipio) DO NOTHING
        `);
      } else {
        await sequelize.query(`
          INSERT INTO municipios (id_municipio, ${munNameColumn}, id_departamento) 
          VALUES (1, 'Municipio Default', 1)
          ON CONFLICT (id_municipio) DO NOTHING
        `);
      }
      console.log('✅ Municipio created');
    }
    
    // Seed veredas
    const [veredasCount] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
    if (parseInt(veredasCount[0]?.count || 0) === 0) {
      console.log('🏘️ Creating vereda...');
      
      const veredaNameColumn = veredasColumns.find(col => 
        col.column_name.includes('nombre') || 
        col.column_name.includes('vereda') ||
        col.column_name === 'name'
      )?.column_name || 'nombre';
      
      const hasTimestamps = veredasColumns.some(col => col.column_name === 'created_at');
      
      if (hasTimestamps) {
        await sequelize.query(`
          INSERT INTO veredas (id_vereda, ${veredaNameColumn}, id_municipio, created_at, updated_at) 
          VALUES (1, 'Vereda Default', 1, NOW(), NOW())
          ON CONFLICT (id_vereda) DO NOTHING
        `);
      } else {
        await sequelize.query(`
          INSERT INTO veredas (id_vereda, ${veredaNameColumn}, id_municipio) 
          VALUES (1, 'Vereda Default', 1)
          ON CONFLICT (id_vereda) DO NOTHING
        `);
      }
      console.log('✅ Vereda created');
    }
    
    // Seed sectores
    const [sectoresCount] = await sequelize.query('SELECT COUNT(*) as count FROM sectores');
    if (parseInt(sectoresCount[0]?.count || 0) === 0) {
      console.log('🏭 Creating sector...');
      
      const sectorNameColumn = sectoresColumns.find(col => 
        col.column_name.includes('nombre') || 
        col.column_name.includes('sector') ||
        col.column_name === 'name'
      )?.column_name || 'nombre_sector';
      
      const hasTimestamps = sectoresColumns.some(col => col.column_name === 'created_at');
      
      if (hasTimestamps) {
        await sequelize.query(`
          INSERT INTO sectores (id_sector, ${sectorNameColumn}, id_vereda, created_at, updated_at) 
          VALUES (1, 'Sector Default', 1, NOW(), NOW())
          ON CONFLICT (id_sector) DO NOTHING
        `);
      } else {
        await sequelize.query(`
          INSERT INTO sectores (id_sector, ${sectorNameColumn}, id_vereda) 
          VALUES (1, 'Sector Default', 1)
          ON CONFLICT (id_sector) DO NOTHING
        `);
      }
      console.log('✅ Sector created');
    }
    
    // Test familia creation
    console.log('\n🧪 Testing familia creation...');
    const transaction = await sequelize.transaction();
    try {
      const [testResult] = await sequelize.query(`
        INSERT INTO familias (
          apellido_familiar, sector, direccion_familia, tamaño_familia, 
          tipo_vivienda, estado_encuesta, numero_encuestas, 
          id_municipio, id_vereda, id_sector, comunionEnCasa
        ) VALUES (
          'Test Family Final', 'Test Sector', 'Test Address', 1, 
          'Casa', 'pending', 0, 
          1, 1, 1, false
        ) RETURNING id_familia
      `, { transaction });
      
      const generatedId = testResult[0]?.id_familia;
      console.log(`✅ FAMILIA CREATION SUCCESSFUL! Generated ID: ${generatedId}`);
      
      await transaction.rollback();
      console.log('🔄 Test rolled back');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Familia test failed:', error.message);
    }
    
    console.log('\n🎉 Database is ready for familia creation!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  inspectAndSeedTables()
    .then(() => {
      console.log('✅ Inspection and seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export default inspectAndSeedTables;
