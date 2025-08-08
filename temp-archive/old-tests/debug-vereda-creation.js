import sequelize from './config/sequelize.js';
import { Veredas, Municipios } from './src/models/index.js';
import veredaService from './src/services/catalog/veredaService.js';

async function debugVeredaCreation() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // First, let's check what municipios actually exist
    console.log('\n--- Checking available municipios ---');
    const municipios = await Municipios.findAll({
      attributes: ['id_municipio', 'nombre_municipio'],
      limit: 5
    });
    
    console.log('Available municipios:');
    municipios.forEach(m => {
      console.log(`ID: ${m.id_municipio} (type: ${typeof m.id_municipio}) - Name: ${m.nombre_municipio}`);
    });

    if (municipios.length === 0) {
      console.log('❌ No municipios found in database!');
      await sequelize.close();
      return;
    }

    // Try with the first available municipio
    const firstMunicipio = municipios[0];
    console.log(`\n--- Testing with municipio ID: ${firstMunicipio.id_municipio} ---`);

    // Test different data type scenarios
    const testCases = [
      {
        name: 'With string ID',
        data: {
          nombre: 'Debug Test 1 ' + Date.now(),
          codigo_vereda: 'DBG1' + Date.now(),
          id_municipio: firstMunicipio.id_municipio.toString() // Convert to string
        }
      },
      {
        name: 'With numeric ID',
        data: {
          nombre: 'Debug Test 2 ' + Date.now(),
          codigo_vereda: 'DBG2' + Date.now(),
          id_municipio: parseInt(firstMunicipio.id_municipio) // Convert to number
        }
      },
      {
        name: 'With BigInt ID',
        data: {
          nombre: 'Debug Test 3 ' + Date.now(),
          codigo_vereda: 'DBG3' + Date.now(),
          id_municipio: BigInt(firstMunicipio.id_municipio) // Convert to BigInt
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- ${testCase.name} ---`);
      try {
        console.log('Test data:', testCase.data);
        const result = await veredaService.findOrCreateVereda(testCase.data);
        console.log('✓ Success:', {
          created: result.created,
          id: result.vereda.id_vereda,
          municipio_id: result.vereda.id_municipio_municipios
        });
      } catch (error) {
        console.log('❌ Failed:', error.message);
      }
    }

    await sequelize.close();
    console.log('\n--- Debug completed ---');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

debugVeredaCreation();
