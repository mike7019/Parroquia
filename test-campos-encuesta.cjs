const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const TEST_CREDENTIALS = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

async function testCamposFaltantes() {
  console.log('🧪 TEST: Verificar campos faltantes (profesion, parentesco, etc.)\n');
  console.log('='.repeat(70));
  
  try {
    // 1. Login
    console.log('\n1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    const token = loginResponse.data.data.accessToken;
    console.log('   ✅ Login exitoso');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Obtener encuesta
    console.log('\n2️⃣ Obteniendo encuesta por ID 48...');
    const response = await axios.get(`${BASE_URL}/encuesta/48`, config);
    const encuesta = response.data.datos || response.data.data;
    
    // 3. Verificar personas
    console.log('\n3️⃣ Verificando campos en personas...\n');
    const personas = encuesta.miembros_familia?.personas || [];
    
    if (personas.length === 0) {
      console.log('   ⚠️  No hay personas en esta encuesta');
      return;
    }
    
    const persona = personas[0];
    console.log(`   👤 Persona: ${persona.nombre_completo}\n`);
    
    // Verificar campos
    const camposEsperados = [
      { nombre: 'Profesión', valor: persona.profesion?.nombre },
      { nombre: 'ID Profesión', valor: persona.profesion?.id },
      { nombre: 'Parentesco', valor: persona.parentesco?.nombre },
      { nombre: 'ID Parentesco', valor: persona.parentesco?.id },
      { nombre: 'Comunidad Cultural', valor: persona.comunidad_cultural?.nombre },
      { nombre: 'ID Comunidad Cultural', valor: persona.comunidad_cultural?.id },
      { nombre: 'Motivo Celebrar', valor: persona.motivo_celebrar },
      { nombre: 'Día Celebrar', valor: persona.dia_celebrar },
      { nombre: 'Mes Celebrar', valor: persona.mes_celebrar },
      { nombre: 'Necesidad Enfermo', valor: persona.necesidad_enfermo }
    ];
    
    let presentes = 0;
    let faltantes = [];
    
    camposEsperados.forEach(({ nombre, valor }) => {
      const presente = valor !== undefined && valor !== null;
      if (presente) {
        console.log(`   ✅ ${nombre.padEnd(25)} = ${JSON.stringify(valor)}`);
        presentes++;
      } else {
        console.log(`   ❌ ${nombre.padEnd(25)} = NO PRESENTE`);
        faltantes.push(nombre);
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 RESULTADO: ${presentes}/${camposEsperados.length} campos presentes`);
    
    if (faltantes.length > 0) {
      console.log('\n❌ CAMPOS FALTANTES:');
      faltantes.forEach(c => console.log(`   • ${c}`));
    } else {
      console.log('\n✅ ¡TODOS LOS CAMPOS PRESENTES! FIX EXITOSO');
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testCamposFaltantes();
