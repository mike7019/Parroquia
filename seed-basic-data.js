import sequelize from './config/sequelize.js';

async function seedBasicData() {
  try {
    console.log('🌱 Seeding basic reference data...');
    
    // 1. Check and create municipios
    console.log('📍 Checking municipios...');
    const [municipiosResult] = await sequelize.query('SELECT COUNT(*) as count FROM municipios');
    const municipiosCount = parseInt(municipiosResult[0]?.count || 0);
    console.log(`   Found ${municipiosCount} municipios`);
    
    if (municipiosCount === 0) {
      console.log('   Creating default municipio...');
      await sequelize.query(`
        INSERT INTO municipios (id_municipio, nombre_municipio, id_departamento) 
        VALUES (1, 'Municipio Default', 1)
        ON CONFLICT (id_municipio) DO NOTHING
      `);
      console.log('   ✅ Default municipio created');
    }
    
    // 2. Check and create veredas
    console.log('🏘️ Checking veredas...');
    const [veredasResult] = await sequelize.query('SELECT COUNT(*) as count FROM veredas');
    const veredasCount = parseInt(veredasResult[0]?.count || 0);
    console.log(`   Found ${veredasCount} veredas`);
    
    if (veredasCount === 0) {
      console.log('   Creating default vereda...');
      await sequelize.query(`
        INSERT INTO veredas (id_vereda, nombre_vereda, id_municipio) 
        VALUES (1, 'Vereda Default', 1)
        ON CONFLICT (id_vereda) DO NOTHING
      `);
      console.log('   ✅ Default vereda created');
    }
    
    // 3. Check and create sectores
    console.log('🏙️ Checking sectores...');
    const [sectoresResult] = await sequelize.query('SELECT COUNT(*) as count FROM sectores');
    const sectoresCount = parseInt(sectoresResult[0]?.count || 0);
    console.log(`   Found ${sectoresCount} sectores`);
    
    if (sectoresCount === 0) {
      console.log('   Creating default sector...');
      await sequelize.query(`
        INSERT INTO sectores (id_sector, nombre_sector, id_vereda) 
        VALUES (1, 'Sector Default', 1)
        ON CONFLICT (id_sector) DO NOTHING
      `);
      console.log('   ✅ Default sector created');
    }
    
    // 4. Check and create departamentos if needed
    console.log('🗺️ Checking departamentos...');
    const [deptosResult] = await sequelize.query('SELECT COUNT(*) as count FROM departamentos');
    const deptosCount = parseInt(deptosResult[0]?.count || 0);
    console.log(`   Found ${deptosCount} departamentos`);
    
    if (deptosCount === 0) {
      console.log('   Creating default departamento...');
      await sequelize.query(`
        INSERT INTO departamentos (id_departamento, nombre_departamento) 
        VALUES (1, 'Departamento Default')
        ON CONFLICT (id_departamento) DO NOTHING
      `);
      console.log('   ✅ Default departamento created');
    }
    
    // 5. Test creating a familia now that reference data exists
    console.log('🧪 Testing familia creation with reference data...');
    const transaction = await sequelize.transaction();
    try {
      const [testResult] = await sequelize.query(`
        INSERT INTO familias (
          apellido_familiar, sector, direccion_familia, tamaño_familia, 
          tipo_vivienda, estado_encuesta, numero_encuestas, 
          id_municipio, id_vereda, id_sector, comunionEnCasa
        ) VALUES (
          'Test Family', 'Test Sector', 'Test Address', 1, 
          'Casa', 'pending', 0, 
          1, 1, 1, false
        ) RETURNING id_familia
      `, { transaction });
      
      const generatedId = testResult[0]?.id_familia;
      console.log(`✅ Test successful! Generated familia ID: ${generatedId}`);
      
      // Rollback the test
      await transaction.rollback();
      console.log('🔄 Test transaction rolled back');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Test still failed:', error.message);
      throw error;
    }
    
    console.log('🎉 Basic data seeded successfully!');
    console.log('📋 Summary:');
    console.log(`   - Municipios: ${municipiosCount === 0 ? '1 created' : municipiosCount + ' existing'}`);
    console.log(`   - Veredas: ${veredasCount === 0 ? '1 created' : veredasCount + ' existing'}`);
    console.log(`   - Sectores: ${sectoresCount === 0 ? '1 created' : sectoresCount + ' existing'}`);
    console.log(`   - Departamentos: ${deptosCount === 0 ? '1 created' : deptosCount + ' existing'}`);
    console.log('   - Familias sequence: ✅ Working correctly');
    
  } catch (error) {
    console.error('❌ Error seeding basic data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBasicData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedBasicData;
