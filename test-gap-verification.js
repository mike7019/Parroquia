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

const testGapDetection = async () => {
  console.log('🔍 Analizando IDs actuales y detectando gaps...\n');
  
  const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const corregimientos = response.data.data || [];
  const ids = corregimientos.map(c => parseInt(c.id_corregimiento)).sort((a, b) => a - b);
  
  console.log('IDs actuales ordenados:', ids.join(', '));
  console.log('');
  
  // Detectar gaps manualmente
  console.log('📊 Análisis de gaps:');
  const gaps = [];
  for (let i = 0; i < ids.length; i++) {
    const expectedId = i + 1;
    const actualId = ids[i];
    
    console.log(`   Posición ${i}: esperado=${expectedId}, actual=${actualId}, ${actualId === expectedId ? '✅' : '❌ GAP'}`);
    
    if (actualId !== expectedId) {
      gaps.push(expectedId);
    }
  }
  
  const nextSequential = ids.length + 1;
  
  console.log('');
  console.log('🎯 Resultado del análisis:');
  console.log(`   Gaps detectados: ${gaps.length > 0 ? gaps.join(', ') : 'ninguno'}`);
  console.log(`   Próximo ID secuencial: ${nextSequential}`);
  console.log(`   Próximo ID que DEBERÍA asignar: ${gaps.length > 0 ? gaps[0] : nextSequential}`);
  
  return gaps.length > 0 ? gaps[0] : nextSequential;
};

const crearYVerificar = async (nombreBase) => {
  console.log(`\n➕ Creando "${nombreBase}"...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/catalog/corregimientos`, {
      nombre: nombreBase,
      id_municipio_municipios: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const corr = response.data.data;
    console.log(`   ✅ Creado: ID ${corr.id_corregimiento} | Código: ${corr.codigo_corregimiento}`);
    return corr.id_corregimiento;
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

(async () => {
  await login();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('        TEST: VERIFICACIÓN DE GAP FILLING');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const idEsperado = await testGapDetection();
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  const idCreado = await crearYVerificar('TEST Gap Filling ' + Date.now());
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    RESULTADO');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (idCreado) {
    console.log(`   ID esperado: ${idEsperado}`);
    console.log(`   ID obtenido: ${idCreado}`);
    console.log('');
    
    if (parseInt(idCreado) === idEsperado) {
      console.log('   ✅ ¡GAP FILLING FUNCIONA CORRECTAMENTE!');
    } else {
      console.log('   ❌ GAP FILLING NO FUNCIONA - IDs no coinciden');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
})();
