import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    authToken = response.data.data?.accessToken || response.data.accessToken;
    console.log('✅ Login exitoso\n');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function testConLogs() {
  console.log('═'.repeat(80));
  console.log('🐛 TEST CON LOGS: Crear encuesta con corregimiento');
  console.log('═'.repeat(80));
  console.log('');

  const loginOk = await login();
  if (!loginOk) return;

  // Generar apellido único con timestamp
  const timestamp = Date.now();
  const apellidoUnico = `TEST_DEBUG_${timestamp}`;

  const encuestaData = {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 1, nombre: "San José" },
      sector: { id: 1, nombre: "Centro" },
      vereda: { id: 1, nombre: "La Macarena" },
      corregimiento: { id: 1, nombre: "El Centro" },  // ← CAMPO CORREGIMIENTO
      fecha: new Date().toISOString(),
      apellido_familiar: apellidoUnico,
      direccion: `Calle Debug ${timestamp}`,
      telefono: `300${timestamp.toString().slice(-7)}`,
      numero_contrato_epm: "DEBUG-001",
      comunionEnCasa: false
    },
    vivienda: {
      tipo_vivienda: { id: 1, nombre: "Casa" },
      disposicion_basuras: {
        recolector: true,
        quemada: false,
        enterrada: false,
        recicla: false,
        aire_libre: false,
        no_aplica: false
      }
    },
    servicios_agua: {
      sistema_acueducto: { id: 1, nombre: "Acueducto" },
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Test",
      observaciones_encuestador: "Test con logs de depuración",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Test Debug Persona",
        numeroIdentificacion: `DEBUG${timestamp}`,
        tipoIdentificacion: { id: 1, nombre: "CC" },
        fechaNacimiento: "1990-01-01",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3001111111",
        situacionCivil: { id: 1, nombre: "Soltero" },
        estudio: { id: 1, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "M",
        talla_pantalon: "32",
        talla_zapato: "40",
        profesion: { id: 1, nombre: "Ingeniero" }
      }
    ]
  };

  console.log('📤 PAYLOAD corregimiento que se enviará:');
  console.log(JSON.stringify(encuestaData.informacionGeneral.corregimiento, null, 2));
  console.log('');

  try {
    console.log('⏳ Enviando POST a /api/encuesta...');
    console.log('   (Revisa los logs del servidor en la terminal para ver los DEBUG)');
    console.log('');
    
    const response = await axios.post(`${API_URL}/encuesta`, encuestaData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const familiaId = response.data.data?.familia_id || response.data.data?.id_familia;
    console.log(`✅ Encuesta creada - Familia ID: ${familiaId}`);
    console.log('');

    // Consultar inmediatamente
    console.log('🔍 Consultando encuesta recién creada...');
    const getResponse = await axios.get(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const familia = getResponse.data.data;
    console.log('');
    console.log('═'.repeat(80));
    console.log('📊 RESULTADO:');
    console.log('═'.repeat(80));
    console.log('   - ID Familia:', familia.id_encuesta || familia.id_familia);
    console.log('   - Apellido:', familia.apellido_familiar);
    console.log('   - Corregimiento objeto:', JSON.stringify(familia.corregimiento, null, 2));
    console.log('');

    if (familia.corregimiento?.id == 1 && familia.corregimiento?.nombre) {
      console.log('✅ ¡FUNCIONA! El corregimiento se guardó y consultó correctamente');
      console.log(`   → ID: ${familia.corregimiento.id}`);
      console.log(`   → Nombre: ${familia.corregimiento.nombre}`);
    } else if (!familia.corregimiento || familia.corregimiento.id === null) {
      console.log('❌ PROBLEMA: corregimiento es NULL o undefined');
      console.log('   → Revisa los logs del servidor (arriba) para ver:');
      console.log('      - 🔍 DEBUG crearRegistroFamilia - informacionGeneral.corregimiento');
      console.log('      - 🔍 DEBUG familiaData construido');
      console.log('   → Esto te mostrará si el valor llega al controlador');
    }
    console.log('═'.repeat(80));
    console.log('');

    // Limpiar
    console.log('🧹 Limpiando familia de prueba...');
    await axios.delete(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Limpieza completa');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }

  console.log('');
  console.log('═'.repeat(80));
  console.log('📝 PRÓXIMOS PASOS:');
  console.log('═'.repeat(80));
  console.log('1. Revisa los logs del servidor (terminal donde corre npm run dev)');
  console.log('2. Busca las líneas que dicen "🔍 DEBUG"');
  console.log('3. Verifica si informacionGeneral.corregimiento tiene el valor correcto');
  console.log('4. Si el valor es correcto pero id_corregimiento es NULL, hay un bug en el INSERT');
  console.log('5. Si el valor es undefined/null, hay un problema en el middleware o validador');
  console.log('═'.repeat(80));
}

testConLogs();
