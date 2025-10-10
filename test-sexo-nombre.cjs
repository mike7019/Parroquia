const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const TEST_CREDENTIALS = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

async function testSexoNombre() {
  console.log('🧪 TEST: Verificar que sexo devuelve "nombre" (Masculino/Femenino/Otro)\n');
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
    const encuesta = response.data.data || response.data.datos;
    
    // 3. Verificar campo sexo en personas
    console.log('\n3️⃣ Verificando campo sexo...\n');
    
    const personas = encuesta.miembros_familia?.personas || [];
    
    if (personas.length === 0) {
      console.log('   ⚠️  No hay personas en esta encuesta');
      return;
    }
    
    const persona = personas[0];
    console.log(`   👤 Persona: ${persona.nombre_completo}\n`);
    
    // Verificar estructura del campo sexo
    console.log('   📊 Campo sexo:');
    console.log(`      Estructura completa: ${JSON.stringify(persona.sexo, null, 2)}`);
    
    if (persona.sexo) {
      const tieneNombre = persona.sexo.hasOwnProperty('nombre');
      const tieneDescripcion = persona.sexo.hasOwnProperty('descripcion');
      const valorNombre = persona.sexo.nombre;
      
      console.log(`\n   ${tieneNombre ? '✅' : '❌'} Tiene campo "nombre"`);
      console.log(`   ${!tieneDescripcion ? '✅' : '⚠️'} ${!tieneDescripcion ? 'NO tiene' : 'Tiene'} campo "descripcion" (debería ser solo "nombre")`);
      
      if (tieneNombre) {
        console.log(`   📝 Valor del nombre: "${valorNombre}"`);
        
        const valoresValidos = ['Masculino', 'Femenino', 'Otro'];
        const esValido = valoresValidos.includes(valorNombre);
        
        console.log(`   ${esValido ? '✅' : '❌'} Valor es ${esValido ? 'válido' : 'inválido'} (esperado: Masculino/Femenino/Otro)`);
      }
    } else {
      console.log('   ❌ Campo sexo es null o undefined');
    }
    
    console.log('\n' + '='.repeat(70));
    
    const exito = persona.sexo && 
                  persona.sexo.hasOwnProperty('nombre') && 
                  !persona.sexo.hasOwnProperty('descripcion') &&
                  ['Masculino', 'Femenino', 'Otro'].includes(persona.sexo.nombre);
    
    if (exito) {
      console.log('\n✅ ¡FIX EXITOSO! Sexo devuelve "nombre" correctamente');
    } else {
      console.log('\n❌ Problema detectado en campo sexo');
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

testSexoNombre();
