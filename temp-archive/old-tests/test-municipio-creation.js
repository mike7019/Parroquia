import { Municipios, Departamentos } from './src/models/catalog/index.js';

async function testMunicipioCreation() {
  try {
    // First, check available departamentos
    const departamentos = await Departamentos.findAll();
    console.log('Departamentos disponibles:');
    departamentos.forEach(d => {
      console.log(`- ID: ${d.id_departamento}, Nombre: ${d.nombre}, Código: ${d.codigo_dane}`);
    });
    
    // Try creating a municipio with valid departamento ID
    const testData = {
      nombre_municipio: 'Yolombó',
      codigo_dane: '05895',
      id_departamento: 1 // Antioquia
    };
    
    console.log('\nIntentando crear municipio con datos:', testData);
    
    const [municipio, created] = await Municipios.findOrCreate({
      where: {
        codigo_dane: testData.codigo_dane
      },
      defaults: testData
    });
    
    if (created) {
      console.log('✅ Municipio creado exitosamente:');
      console.log({
        id: municipio.id_municipio,
        nombre: municipio.nombre_municipio,
        codigo_dane: municipio.codigo_dane,
        id_departamento: municipio.id_departamento
      });
    } else {
      console.log('ℹ️  Municipio ya existía:');
      console.log({
        id: municipio.id_municipio,
        nombre: municipio.nombre_municipio,
        codigo_dane: municipio.codigo_dane,
        id_departamento: municipio.id_departamento
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMunicipioCreation();
