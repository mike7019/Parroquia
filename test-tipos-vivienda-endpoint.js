import TipoVivienda from './src/models/catalog/TipoVivienda.js';
import sequelize from './config/sequelize.js';

const testTiposViviendaEndpoint = async () => {
  try {
    console.log('🔍 Testing tipos-vivienda endpoint simulation...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Load the model first
    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized');
    
    // Test the exact query that's failing
    console.log('\n🧪 Testing query with sortBy=nombre and sortOrder=ASC...');
    
    try {
      const tipos = await TipoVivienda.findAll({
        order: [['nombre', 'ASC']]
      });
      
      console.log('✅ Query successful!');
      console.log(`📊 Found ${tipos.length} records:`);
      tipos.forEach(tipo => {
        console.log(`   - ID: ${tipo.id_tipo_vivienda}, Nombre: ${tipo.nombre}, Activo: ${tipo.activo}`);
      });
      
    } catch (queryError) {
      console.log('❌ Query failed:', queryError.message);
      console.log('Error details:', queryError);
    }
    
    // Test the specific service method
    console.log('\n🧪 Testing service method...');
    
    try {
      // Import the service
      const { default: tipoViviendaService } = await import('./src/services/catalog/tipoViviendaService.js');
      
      const result = await tipoViviendaService.getAllTipos(null, 'nombre', 'ASC');
      console.log('✅ Service method successful!');
      console.log(`📊 Service returned ${result.total} records`);
      
    } catch (serviceError) {
      console.log('❌ Service method failed:', serviceError.message);
      console.log('Error details:', serviceError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

testTiposViviendaEndpoint();
