import { Veredas } from './src/models/index.js';

async function quickTest() {
  try {
    console.log('🧪 Prueba rápida del servicio veredas...');
    
    const count = await Veredas.count();
    console.log(`📊 Total veredas: ${count}`);
    
    const first = await Veredas.findOne({
      attributes: ['id_vereda', 'nombre', 'nombre_vereda', 'codigo_vereda']
    });
    
    if (first) {
      console.log('📋 Primera vereda:');
      console.log(`  ID: ${first.id_vereda}`);
      console.log(`  Nombre: ${first.nombre}`);
      console.log(`  Nombre Vereda: ${first.nombre_vereda}`);
      console.log(`  Código: ${first.codigo_vereda}`);
    }
    
    console.log('\n✅ Servicio funcionando correctamente');
    console.log('🎉 La API de veredas debería responder sin errores ahora');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest().catch(console.error);
