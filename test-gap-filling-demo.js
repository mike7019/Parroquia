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

const listarIDs = async (titulo) => {
  const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const corregimientos = response.data.data || [];
  const ids = corregimientos.map(c => parseInt(c.id_corregimiento)).sort((a, b) => a - b);
  
  console.log(`\n${titulo}`);
  console.log(`IDs actuales: [${ids.join(', ')}]`);
  console.log(`Total: ${ids.length} corregimientos\n`);
  
  return ids;
};

const eliminar = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/catalog/corregimientos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Eliminado ID ${id}`);
    return true;
  } catch (error) {
    console.log(`❌ No se pudo eliminar ID ${id}: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const crear = async (nombre) => {
  try {
    const response = await axios.post(`${BASE_URL}/catalog/corregimientos`, {
      nombre,
      id_municipio_municipios: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const corr = response.data.data;
    console.log(`✅ Creado: ID ${corr.id_corregimiento} | Código: ${corr.codigo_corregimiento} | Nombre: ${corr.nombre}`);
    return parseInt(corr.id_corregimiento);
  } catch (error) {
    console.log(`❌ Error creando "${nombre}": ${error.response?.data?.message || error.message}`);
    return null;
  }
};

(async () => {
  await login();
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('         TEST: DEMOSTRACIÓN DE GAP FILLING AUTOMÁTICO');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Paso 1: Ver IDs iniciales
  let ids = await listarIDs('📊 PASO 1: Estado inicial');
  
  // Paso 2: Eliminar algunos IDs para crear gaps
  console.log('🗑️  PASO 2: Eliminando ID 6 (si existe)...\n');
  const eliminado = await eliminar(6);
  
  if (!eliminado) {
    console.log('\n⚠️  El ID 6 no existe, no se puede eliminar.');
    console.log('   Voy a eliminar otro ID para crear un gap...\n');
    
    // Eliminar el ID más grande
    const maxId = Math.max(...ids);
    await eliminar(maxId);
  }
  
  // Paso 3: Consultar después de eliminar
  ids = await listarIDs('📊 PASO 3: Después de eliminar (el 6 ya NO está en la lista)');
  
  // Detectar gaps
  const gaps = [];
  for (let i = 0; i < ids.length; i++) {
    const expectedId = i + 1;
    const actualId = ids[i];
    if (actualId !== expectedId) {
      gaps.push(expectedId);
    }
  }
  
  console.log(`🔍 Gaps detectados: ${gaps.length > 0 ? '[' + gaps.join(', ') + ']' : 'ninguno'}`);
  const proximoIdEsperado = gaps.length > 0 ? gaps[0] : ids.length + 1;
  console.log(`🎯 El próximo ID que se asignará será: ${proximoIdEsperado}`);
  
  // Paso 4: Crear un nuevo corregimiento (debería usar el gap)
  console.log(`\n➕ PASO 4: Creando nuevo corregimiento (debería usar ID ${proximoIdEsperado})...\n`);
  const nuevoId = await crear(`Corregimiento Relleno Gap ${Date.now()}`);
  
  // Paso 5: Verificar que se llenó el gap
  await listarIDs('📊 PASO 5: Después de crear nuevo (el gap se llenó)');
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                          RESULTADO                             ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (nuevoId === proximoIdEsperado) {
    console.log('✅ ¡GAP FILLING FUNCIONA CORRECTAMENTE!');
    console.log(`   El ID ${nuevoId} fue asignado automáticamente (gap reutilizado)`);
  } else {
    console.log('❌ Gap filling no funcionó como esperado');
    console.log(`   Se esperaba ID ${proximoIdEsperado} pero se obtuvo ${nuevoId}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  
  console.log('\n💡 EXPLICACIÓN:');
  console.log('   1. Cuando ELIMINAS un ID, desaparece de la lista (correcto)');
  console.log('   2. El gap NO se "rellena" automáticamente en la consulta');
  console.log('   3. El gap SE REUTILIZA cuando CREAS un nuevo registro');
  console.log('   4. Por eso necesitas CREAR después de ELIMINAR para ver el efecto\n');
})();
