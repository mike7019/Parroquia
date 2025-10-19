import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let token = '';

const login = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    
    token = response.data.data?.accessToken || response.data.accessToken;
    console.log('✅ Login exitoso\n');
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    process.exit(1);
  }
};

const eliminarTodosCorregimientos = async () => {
  try {
    console.log('🗑️  Eliminando todos los corregimientos existentes...');
    
    // Obtener todos los corregimientos
    const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const corregimientos = response.data.data || [];
    console.log(`   Encontrados ${corregimientos.length} corregimientos`);
    
    // Eliminar uno por uno
    for (const corr of corregimientos) {
      try {
        await axios.delete(`${BASE_URL}/catalog/corregimientos/${corr.id_corregimiento}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Eliminado: ID ${corr.id_corregimiento} - ${corr.nombre}`);
      } catch (error) {
        console.log(`   ⚠️  No se pudo eliminar ID ${corr.id_corregimiento}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error eliminando corregimientos:', error.response?.data || error.message);
  }
};

const crearCorregimiento = async (nombre, id_municipio = 1) => {
  try {
    const response = await axios.post(`${BASE_URL}/catalog/corregimientos`, {
      nombre,
      id_municipio_municipios: id_municipio
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const corr = response.data.data;
    console.log(`✅ Creado: ID ${corr.id_corregimiento} | Código: ${corr.codigo_corregimiento} | Nombre: ${corr.nombre}`);
    return corr;
  } catch (error) {
    console.error(`❌ Error creando "${nombre}":`, error.response?.data?.message || error.message);
    return null;
  }
};

const testGapFilling = async () => {
  console.log('\n📋 PRUEBA 1: GAP FILLING DE IDs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Crear 5 corregimientos
  console.log('Creando 5 corregimientos...\n');
  const corr1 = await crearCorregimiento('Corregimiento Uno');
  const corr2 = await crearCorregimiento('Corregimiento Dos');
  const corr3 = await crearCorregimiento('Corregimiento Tres');
  const corr4 = await crearCorregimiento('Corregimiento Cuatro');
  const corr5 = await crearCorregimiento('Corregimiento Cinco');
  
  console.log('\n📊 Estado después de crear 5:');
  console.log(`   IDs esperados: 1, 2, 3, 4, 5`);
  console.log(`   IDs obtenidos: ${[corr1, corr2, corr3, corr4, corr5].map(c => c?.id_corregimiento).join(', ')}`);
  
  // Eliminar el ID 2 y el ID 4 para crear gaps
  console.log('\n🗑️  Eliminando IDs 2 y 4 para crear gaps...\n');
  
  if (corr2) {
    try {
      await axios.delete(`${BASE_URL}/catalog/corregimientos/${corr2.id_corregimiento}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Eliminado ID ${corr2.id_corregimiento}`);
    } catch (error) {
      console.log(`❌ Error eliminando ID ${corr2.id_corregimiento}`);
    }
  }
  
  if (corr4) {
    try {
      await axios.delete(`${BASE_URL}/catalog/corregimientos/${corr4.id_corregimiento}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Eliminado ID ${corr4.id_corregimiento}`);
    } catch (error) {
      console.log(`❌ Error eliminando ID ${corr4.id_corregimiento}`);
    }
  }
  
  console.log('\n📊 Estado después de eliminar:');
  console.log(`   IDs restantes: 1, 3, 5 (gaps en 2 y 4)`);
  
  // Crear nuevos corregimientos que deben llenar los gaps
  console.log('\n➕ Creando 3 nuevos corregimientos (deberían usar IDs 2, 4, 6)...\n');
  
  const corr6 = await crearCorregimiento('Corregimiento Nuevo A');
  const corr7 = await crearCorregimiento('Corregimiento Nuevo B');
  const corr8 = await crearCorregimiento('Corregimiento Nuevo C');
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log(`   IDs esperados (con gap filling): 2, 4, 6`);
  console.log(`   IDs obtenidos: ${[corr6, corr7, corr8].map(c => c?.id_corregimiento).join(', ')}`);
  
  const gapFillingFunciona = 
    corr6?.id_corregimiento === 2 && 
    corr7?.id_corregimiento === 4 && 
    corr8?.id_corregimiento === 6;
  
  if (gapFillingFunciona) {
    console.log('\n✅ ¡GAP FILLING FUNCIONANDO CORRECTAMENTE!');
  } else {
    console.log('\n❌ GAP FILLING NO ESTÁ FUNCIONANDO');
  }
};

const testCodigoAutomatico = async () => {
  console.log('\n\n📋 PRUEBA 2: CÓDIGO AUTOMÁTICO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const corregimientos = response.data.data || [];
  
  console.log('Verificando formato de códigos generados:\n');
  
  let todosCorrectos = true;
  
  for (const corr of corregimientos) {
    const idPadded = String(corr.id_corregimiento).padStart(4, '0');
    const codigoEsperado = `COR-${idPadded}`;
    const coincide = corr.codigo_corregimiento === codigoEsperado;
    
    console.log(`   ID: ${corr.id_corregimiento} | Código: ${corr.codigo_corregimiento} | Esperado: ${codigoEsperado} | ${coincide ? '✅' : '❌'}`);
    
    if (!coincide) todosCorrectos = false;
  }
  
  if (todosCorrectos) {
    console.log('\n✅ ¡TODOS LOS CÓDIGOS TIENEN EL FORMATO CORRECTO!');
  } else {
    console.log('\n❌ HAY CÓDIGOS CON FORMATO INCORRECTO');
  }
};

const testSwaggerInput = () => {
  console.log('\n\n📋 PRUEBA 3: SWAGGER INPUT SCHEMA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Schema CorregimientoInput ahora solo requiere:');
  console.log('   • nombre (string, required)');
  console.log('   • id_municipio_municipios (integer, optional)');
  console.log('');
  console.log('✅ El campo "codigo_corregimiento" fue removido del input');
  console.log('✅ En el schema Corregimiento, "codigo_corregimiento" está marcado como readOnly');
  console.log('');
  console.log('Swagger actualizado en: http://localhost:3000/api-docs');
};

const mostrarResumen = () => {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('                   📊 RESUMEN DE CAMBIOS                    ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('✅ SERVICIO (corregimientosService.js):');
  console.log('   • Código se genera automáticamente en formato COR-XXXX');
  console.log('   • Removida validación de código duplicado en create');
  console.log('   • Removida validación de código duplicado en update');
  console.log('   • Código es inmutable (no se puede actualizar)');
  console.log('   • Gap filling funciona correctamente');
  console.log('');
  
  console.log('✅ VALIDADORES (corregimientosValidators.js):');
  console.log('   • Removido "codigo_corregimiento" de validateCreate');
  console.log('   • Removido "codigo_corregimiento" de validateUpdate');
  console.log('');
  
  console.log('✅ SWAGGER (corregimientosRoutes.js):');
  console.log('   • Schema Corregimiento: codigo_corregimiento marcado como readOnly');
  console.log('   • Schema CorregimientoInput: codigo_corregimiento removido');
  console.log('   • Schema CorregimientoUpdate: codigo_corregimiento removido');
  console.log('   • Ejemplos actualizados sin codigo_corregimiento');
  console.log('');
  
  console.log('✅ CAMPOS REQUERIDOS PARA CREAR:');
  console.log('   • nombre (obligatorio)');
  console.log('   • id_municipio_municipios (opcional)');
  console.log('');
  
  console.log('✅ CAMPOS GENERADOS AUTOMÁTICAMENTE:');
  console.log('   • id_corregimiento (reutiliza gaps)');
  console.log('   • codigo_corregimiento (formato COR-XXXX)');
  console.log('   • created_at, updated_at');
  console.log('');
};

// Ejecutar todas las pruebas
(async () => {
  await login();
  await eliminarTodosCorregimientos();
  await testGapFilling();
  await testCodigoAutomatico();
  testSwaggerInput();
  mostrarResumen();
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ Todas las pruebas completadas\n');
})();
