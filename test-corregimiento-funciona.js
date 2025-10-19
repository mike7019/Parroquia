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

async function testCorregimientoIntegration() {
  console.log('═'.repeat(80));
  console.log('🧪 TEST: Verificar que el campo corregimiento SE GUARDA correctamente');
  console.log('═'.repeat(80));
  console.log('');

  const loginOk = await login();
  if (!loginOk) return;

  // Crear encuesta CON corregimiento
  console.log('📝 Creando encuesta CON corregimiento (ID: 1)...');
  
  const encuestaData = {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Test" },
      parroquia: { id: 1, nombre: "Test" },
      sector: { id: 1, nombre: "Test" },
      vereda: { id: 1, nombre: "Test" },
      corregimiento: { id: 1, nombre: "El Centro" },  // ← AQUÍ ESTÁ EL CORREGIMIENTO
      fecha: new Date().toISOString(),
      apellido_familiar: "TEST_VERIFICACION_CORR",
      direccion: "Calle Test 999",
      telefono: "3009999999",
      numero_contrato_epm: "TEST-999",
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
      observaciones_encuestador: "Test verificación corregimiento",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Test Persona",
        numeroIdentificacion: `TEST${Date.now()}`,
        tipoIdentificacion: { id: 1, nombre: "CC" },
        fechaNacimiento: "1990-01-01",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3009999999",
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

  console.log('📤 PAYLOAD ENVIADO:');
  console.log('   - corregimiento en payload:', JSON.stringify(encuestaData.informacionGeneral.corregimiento));
  console.log('');

  try {
    const response = await axios.post(`${API_URL}/encuesta`, encuestaData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const familiaId = response.data.data?.id_familia;
    console.log(`✅ Encuesta creada - Familia ID: ${familiaId}\n`);

    // Consultar la encuesta
    console.log(`🔍 Consultando encuesta ID ${familiaId}...`);
    const getResponse = await axios.get(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const familia = getResponse.data.data;
    console.log('📊 RESPUESTA OBTENIDA:');
    console.log('   - id_familia:', familia.id_familia);
    console.log('   - apellido_familiar:', familia.apellido_familiar);
    console.log('   - id_corregimiento:', familia.id_corregimiento);
    console.log('   - nombre_corregimiento:', familia.nombre_corregimiento);
    console.log('');

    if (familia.id_corregimiento && familia.nombre_corregimiento) {
      console.log('✅ ¡ÉXITO! El corregimiento SE GUARDÓ Y SE CONSULTA correctamente');
      console.log(`   → id_corregimiento: ${familia.id_corregimiento}`);
      console.log(`   → nombre_corregimiento: ${familia.nombre_corregimiento}`);
    } else if (familia.id_corregimiento && !familia.nombre_corregimiento) {
      console.log('⚠️  ID se guardó pero LEFT JOIN no devuelve el nombre');
      console.log(`   → Verificar que existe corregimiento con ID ${familia.id_corregimiento}`);
    } else {
      console.log('❌ ERROR: El corregimiento NO se guardó en la base de datos');
      console.log('   → Revisar controlador encuestaController.refactored.js');
      console.log('   → Verificar que "informacionGeneral.corregimiento" se procesa correctamente');
    }
    console.log('');

    // Limpiar
    console.log('🧹 Limpiando...');
    await axios.delete(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Familia eliminada\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('═'.repeat(80));
}

testCorregimientoIntegration();
