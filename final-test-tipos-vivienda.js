import TipoVivienda from './src/models/catalog/TipoVivienda.js';
import sequelize from './config/sequelize.js';

const testApiEndpoint = async () => {
  try {
    console.log('🔍 Final test: tipos-vivienda endpoint query simulation...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Test the exact same query the API would run
    console.log('\n🧪 Testing API query simulation with sortBy=nombre, sortOrder=ASC...');
    
    // This simulates what the service does when called by the controller
    const whereClause = {};
    const search = null;
    const sortBy = 'nombre';
    const sortOrder = 'ASC';
    
    // Add search filter if provided (none in this case)
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const tipos = await TipoVivienda.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    console.log('✅ Query successful!');
    console.log(`📊 Found ${tipos.length} tipos de vivienda:`);
    
    tipos.forEach((tipo, index) => {
      console.log(`   ${index + 1}. ID: ${tipo.id_tipo_vivienda} | Nombre: "${tipo.nombre}" | Activo: ${tipo.activo} | Descripción: ${tipo.descripcion || 'N/A'}`);
    });
    
    console.log('\n✅ The column "activo" issue has been resolved!');
    console.log('🎉 The /api/catalog/tipos-vivienda endpoint should now work correctly.');
    
    // Verify the structure matches what the API expects
    if (tipos.length > 0) {
      const firstTipo = tipos[0];
      const expectedFields = ['id_tipo_vivienda', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at'];
      const actualFields = Object.keys(firstTipo.dataValues);
      
      console.log('\n📋 Field validation:');
      expectedFields.forEach(field => {
        const exists = actualFields.includes(field);
        console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? 'Present' : 'Missing'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
  } finally {
    await sequelize.close();
  }
};

testApiEndpoint();
