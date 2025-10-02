import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function testSimplifiedResponse() {
  console.log('🎯 PROBANDO RESPUESTA SIMPLIFICADA\n');

  try {
    await sequelize.sync({ alter: false });

    // Crear una nueva situación civil
    const timestamp = Date.now();
    const nuevoNombre = `Unión Libre ${timestamp}`;
    
    console.log('📝 Creando situación civil con nombre:', nuevoNombre);
    
    const resultado = await SituacionCivilService.createSituacionCivil({
      nombre: nuevoNombre,
      descripcion: "Pareja que convive sin matrimonio civil o religioso"
    });
    
    console.log('\n✅ RESPUESTA DE CREACIÓN:');
    console.log(JSON.stringify(resultado, null, 2));
    
    console.log('\n📋 CAMPOS DEVUELTOS:');
    Object.keys(resultado).forEach(key => {
      console.log(`   - ${key}: ${resultado[key]}`);
    });
    
    console.log('\n🔍 VERIFICANDO CAMPOS REQUERIDOS:');
    const camposRequeridos = ['id', 'nombre', 'descripcion', 'createdAt', 'updatedAt'];
    const camposPresentes = Object.keys(resultado);
    
    camposRequeridos.forEach(campo => {
      const presente = camposPresentes.includes(campo);
      console.log(`   ${presente ? '✅' : '❌'} ${campo}: ${presente ? 'PRESENTE' : 'AUSENTE'}`);
    });
    
    console.log('\n🚫 VERIFICANDO CAMPOS NO DESEADOS:');
    const camposNoDeseados = ['activo', 'orden', 'codigo'];
    camposNoDeseados.forEach(campo => {
      const presente = camposPresentes.includes(campo);
      console.log(`   ${presente ? '❌' : '✅'} ${campo}: ${presente ? 'PRESENTE (NO DESEADO)' : 'AUSENTE (CORRECTO)'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
  } finally {
    process.exit(0);
  }
}

testSimplifiedResponse();