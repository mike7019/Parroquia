import sequelize from './config/sequelize.js';
import { Veredas } from './src/models/index.js';

async function testVeredas() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test the corrected model
    const veredas = await Veredas.findAll({ 
      limit: 3,
      attributes: ['id_vereda', 'nombre', 'codigo_vereda', 'id_municipio_municipios', 'id_sector']
    });
    console.log('✅ Model query successful');
    console.log('📊 Sample veredas:');
    veredas.forEach(v => {
      console.log(`  - ID: ${v.id_vereda}, Nombre: ${v.nombre}, Sector: ${v.id_sector || 'null'}`);
    });
    
    const count = await Veredas.count();
    console.log(`📈 Total veredas in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testVeredas().catch(console.error);
