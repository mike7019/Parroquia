import { Municipios, Departamentos } from './src/models/catalog/index.js';

async function validateDatabaseStructure() {
  console.log('🔍 VALIDATING DATABASE STRUCTURE AND CONSTRAINTS');
  console.log('=' .repeat(60));

  try {
    // 1. Check table structure
    console.log('\n📊 Checking Municipios table structure:');
    const municipioAttributes = Municipios.getTableName();
    console.log(`Table name: ${municipioAttributes}`);
    
    const municipioFields = Object.keys(Municipios.rawAttributes);
    console.log('Fields:', municipioFields.join(', '));

    // 2. Check foreign key constraints
    console.log('\n🔗 Checking foreign key constraints:');
    try {
      // Try to insert with invalid departamento
      const invalidMunicipio = await Municipios.create({
        nombre_municipio: 'Test Invalid FK',
        codigo_dane: '00000',
        id_departamento: 99999
      });
      console.log('❌ Foreign key constraint not working - invalid departamento was accepted');
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.log('✅ Foreign key constraint working correctly');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log('⚠️  Unexpected error when testing FK constraint:', error.message);
      }
    }

    // 3. Check unique constraints
    console.log('\n🔒 Checking unique constraints:');
    try {
      // Try to insert duplicate codigo_dane
      const duplicateMunicipio1 = await Municipios.create({
        nombre_municipio: 'Test Duplicate 1',
        codigo_dane: 'DUPTEST',
        id_departamento: 1
      });
      
      const duplicateMunicipio2 = await Municipios.create({
        nombre_municipio: 'Test Duplicate 2',
        codigo_dane: 'DUPTEST', // Same codigo_dane
        id_departamento: 1
      });
      
      console.log('⚠️  Unique constraint not working - duplicate codigo_dane was accepted');
      
      // Clean up
      await duplicateMunicipio1.destroy();
      await duplicateMunicipio2.destroy();
      
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('✅ Unique constraint working correctly');
        console.log(`   Error: ${error.message}`);
      } else {
        console.log('⚠️  Unexpected error when testing unique constraint:', error.message);
      }
    }

    // 4. Check data types and validation
    console.log('\n📝 Checking data types and validation:');
    try {
      const invalidDataMunicipio = await Municipios.create({
        nombre_municipio: '', // Empty string
        codigo_dane: '123456', // Too long (should be 5 chars)
        id_departamento: 'invalid' // Wrong type
      });
      console.log('⚠️  Data validation not strict enough');
    } catch (error) {
      console.log('✅ Data type validation working');
      console.log(`   Error type: ${error.name}`);
    }

    // 5. Check relationship data integrity
    console.log('\n🔄 Checking relationship data integrity:');
    const municipiosWithDept = await Municipios.findAll({
      include: [{
        association: 'departamento',
        required: true
      }],
      limit: 5
    });
    
    console.log(`✅ Found ${municipiosWithDept.length} municipios with valid departamento relationships`);
    
    // Check for orphaned municipios
    const orphanedMunicipios = await Municipios.findAll({
      include: [{
        association: 'departamento',
        required: false
      }],
      where: {
        '$departamento.id_departamento$': null
      }
    });
    
    if (orphanedMunicipios.length > 0) {
      console.log(`⚠️  Found ${orphanedMunicipios.length} orphaned municipios (without valid departamento)`);
    } else {
      console.log('✅ No orphaned municipios found');
    }

    // 6. Performance check
    console.log('\n⚡ Performance check:');
    const startTime = Date.now();
    const allMunicipios = await Municipios.findAll({
      include: [{
        association: 'departamento'
      }]
    });
    const endTime = Date.now();
    console.log(`✅ Retrieved ${allMunicipios.length} municipios with departamentos in ${endTime - startTime}ms`);

  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
  }

  process.exit(0);
}

validateDatabaseStructure();
