import sequelize from './config/sequelize.js';
import { Veredas } from './src/models/index.js';
import veredaService from './src/services/catalog/veredaService.js';

async function testVeredaCreation() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Test creating a vereda
    console.log('\n--- Testing vereda creation ---');
    
    const testVeredaData = {
      nombre: 'Test Vereda ' + Date.now(),
      codigo_vereda: 'TEST' + Date.now(),
      id_municipio: 5 // Using Bogotá D.C. which exists
    };

    console.log('Creating vereda with data:', testVeredaData);
    
    const result = await veredaService.findOrCreateVereda(testVeredaData);
    
    console.log('✓ Vereda creation result:', {
      created: result.created,
      veredaId: result.vereda.id_vereda,
      nombre: result.vereda.nombre,
      codigo_vereda: result.vereda.codigo_vereda
    });

    // Test listing all veredas
    console.log('\n--- Testing vereda listing ---');
    const veredasList = await veredaService.getAllVeredas({ limit: 5 });
    console.log('✓ Found', veredasList.pagination.totalCount, 'veredas');
    console.log('First few veredas:', veredasList.veredas.map(v => ({
      id: v.id_vereda,
      nombre: v.nombre,
      codigo_vereda: v.codigo_vereda
    })));

    await sequelize.close();
    console.log('\n✓ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

testVeredaCreation();
