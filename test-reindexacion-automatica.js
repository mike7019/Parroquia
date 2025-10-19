import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let token = '';

const login = async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  });
  
  token = response.data.data?.accessToken || response.data.accessToken;
  console.log('✅ Login exitoso\n');
};

const listarCorregimientos = async (titulo) => {
  const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100&sortBy=id_corregimiento&sortOrder=ASC`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const corregimientos = response.data.data || [];
  
  console.log(`\n${titulo}`);
  console.log('━'.repeat(80));
  console.log('ID  | Código      | Nombre');
  console.log('━'.repeat(80));
  
  for (const corr of corregimientos) {
    const id = String(corr.id_corregimiento).padStart(3);
    const codigo = corr.codigo_corregimiento.padEnd(11);
    console.log(`${id} | ${codigo} | ${corr.nombre}`);
  }
  
  console.log('━'.repeat(80));
  console.log(`Total: ${corregimientos.length} corregimientos\n`);
  
  return corregimientos.map(c => parseInt(c.id_corregimiento));
};

const eliminar = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/catalog/corregimientos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${response.data.message || 'Eliminado exitosamente'}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const verificarSecuencial = (ids) => {
  let esSecuencial = true;
  let gaps = [];
  
  for (let i = 0; i < ids.length; i++) {
    const esperado = i + 1;
    const actual = ids[i];
    
    if (actual !== esperado) {
      esSecuencial = false;
      gaps.push(esperado);
    }
  }
  
  return { esSecuencial, gaps };
};

(async () => {
  await login();
  
  console.log('═════════════════════════════════════════════════════════════════════════════');
  console.log('               TEST: REINDEXACIÓN AUTOMÁTICA AL ELIMINAR');
  console.log('═════════════════════════════════════════════════════════════════════════════');
  
  // Paso 1: Listar estado inicial
  let ids = await listarCorregimientos('📊 PASO 1: Estado inicial');
  let resultado = verificarSecuencial(ids);
  
  if (resultado.esSecuencial) {
    console.log('✅ IDs son secuenciales (sin gaps)');
  } else {
    console.log(`⚠️  Hay gaps en las posiciones: [${resultado.gaps.join(', ')}]`);
  }
  
  // Paso 2: Eliminar un ID del medio
  const idAEliminar = ids.length > 3 ? ids[Math.floor(ids.length / 2)] : ids[ids.length - 1];
  
  console.log(`\n🗑️  PASO 2: Eliminando el ID ${idAEliminar} (del medio de la lista)...\n`);
  await eliminar(idAEliminar);
  
  // Paso 3: Listar después de eliminar (debería estar reindexado automáticamente)
  console.log('\n⏳ Esperando que la reindexación termine...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
  
  ids = await listarCorregimientos('📊 PASO 3: Después de eliminar (reindexación automática)');
  resultado = verificarSecuencial(ids);
  
  console.log('\n═════════════════════════════════════════════════════════════════════════════');
  console.log('                               RESULTADO');
  console.log('═════════════════════════════════════════════════════════════════════════════\n');
  
  if (resultado.esSecuencial) {
    console.log('✅ ¡REINDEXACIÓN AUTOMÁTICA FUNCIONA!');
    console.log('   Los IDs se reorganizaron automáticamente sin gaps');
    console.log(`   Secuencia perfecta: [${ids.join(', ')}]`);
  } else {
    console.log('❌ Todavía hay gaps después de eliminar');
    console.log(`   Gaps encontrados: [${resultado.gaps.join(', ')}]`);
  }
  
  console.log('\n═════════════════════════════════════════════════════════════════════════════');
  
  console.log('\n💡 COMPORTAMIENTO:');
  console.log('   • Al ELIMINAR un registro, todos los IDs posteriores se decrementan');
  console.log('   • Los códigos se regeneran automáticamente (COR-XXXX)');
  console.log('   • NO necesitas crear registros nuevos para ver el efecto');
  console.log('   • Los IDs siempre serán secuenciales: 1, 2, 3, 4, ...\n');
})();
