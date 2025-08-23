import axios from 'axios';

// Datos de prueba para simular una encuesta duplicada
const encuestaPrueba = {
  informacionGeneral: {
    apellido_familiar: "González Test",
    direccion: "Calle Prueba 123, Barrio Test",
    telefono: "3001234567",
    email: "test@example.com",
    numero_contrato_epm: "TEST123456",
    fecha: new Date().toISOString(),
    municipio: { id: 1, nombre: "Tuluá" },
    vereda: { id: 1, nombre: "Centro" },
    sector: { id: 1, nombre: "Sector 1" }
  },
  vivienda: {
    tipo_vivienda: { id: 1, nombre: "Casa" },
    disposicion_basuras: {
      recolector: true,
      quemada: false,
      enterrada: false,
      recicla: true,
      aire_libre: false,
      no_aplica: false
    }
  },
  servicios_agua: {
    sistema_acueducto: { id: 1, nombre: "Acueducto Público" },
    pozo_septico: false,
    letrina: false,
    campo_abierto: false
  },
  observaciones: {
    sustento_familia: "Trabajo independiente",
    observaciones_encuestador: "Familia colaborativa",
    autorizacion_datos: true
  },
  familyMembers: [
    {
      nombres: "Juan Carlos",
      sexo: "Masculino",
      tipoIdentificacion: "CC",
      fechaNacimiento: "1985-03-15",
      situacionCivil: "Casado",
      estudio: "Bachillerato",
      telefono: "3001234567",
      talla: {
        camisa: "M",
        pantalon: "32",
        calzado: "42"
      }
    },
    {
      nombres: "María Elena",
      sexo: "Femenino", 
      tipoIdentificacion: "CC",
      fechaNacimiento: "1988-07-22",
      situacionCivil: "Casada",
      estudio: "Técnica",
      telefono: "3001234568",
      talla: {
        camisa: "S",
        pantalon: "28",
        calzado: "37"
      }
    }
  ],
  deceasedMembers: [],
  metadata: {
    completed: true,
    currentStage: 6,
    timestamp: new Date().toISOString()
  }
};

const BASE_URL = 'http://localhost:3000';

async function getAuthToken() {
  try {
    // Usar las credenciales proporcionadas por el usuario
    const credenciales = { 
      correo_electronico: "admin@parroquia.com", 
      contrasena: "Admin123!" 
    };
    
    console.log(`🔐 Intentando login con: ${credenciales.correo_electronico}`);
    const response = await axios.post(`${BASE_URL}/api/auth/login`, credenciales);
    
    if (response.data.data?.accessToken) {
      console.log(`✅ Login exitoso con: ${credenciales.correo_electronico}`);
      return response.data.data.accessToken;
    }
    
    console.log('ℹ️ No se pudo obtener token');
    return null;
  } catch (error) {
    console.log(`❌ Error en login: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testDuplicatePrevention() {
  console.log('🧪 INICIANDO PRUEBA DE PREVENCIÓN DE DUPLICADOS\n');
  
  // Obtener token de autenticación
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token de autenticación obtenido');
  } else {
    console.log('⚠️ Procediendo sin autenticación');
  }
  console.log('');
  
  try {
    console.log('📋 Datos de prueba:');
    console.log(`   - Familia: ${encuestaPrueba.informacionGeneral.apellido_familiar}`);
    console.log(`   - Teléfono: ${encuestaPrueba.informacionGeneral.telefono}`);
    console.log(`   - Dirección: ${encuestaPrueba.informacionGeneral.direccion}`);
    console.log(`   - Miembros: ${encuestaPrueba.familyMembers.length}`);
    console.log('');

    // PRIMER INTENTO - Debe ser exitoso
    console.log('🚀 PRIMER INTENTO - Creando encuesta inicial...');
    const response1 = await axios.post(`${BASE_URL}/api/encuesta`, encuestaPrueba, { headers });

    if (response1.status === 201) {
      console.log('✅ PRIMER INTENTO EXITOSO');
      console.log(`   - Status: ${response1.status}`);
      console.log(`   - Familia ID: ${response1.data.data.familia_id}`);
      console.log(`   - Código Familia: ${response1.data.data.codigo_familia}`);
      console.log(`   - Personas creadas: ${response1.data.data.personas_creadas}`);
      console.log(`   - Validación duplicados: ${response1.data.data.metadata.validacion_duplicados}`);
      console.log('');
    }

    // SEGUNDO INTENTO - Debe ser rechazado
    console.log('🔄 SEGUNDO INTENTO - Intentando crear encuesta duplicada...');
    
    try {
      const response2 = await axios.post(`${BASE_URL}/api/encuesta`, encuestaPrueba, { headers });
      
      // Si llega aquí, significa que NO se previno el duplicado
      console.log('❌ ERROR: El sistema NO previno la duplicación');
      console.log(`   - Status inesperado: ${response2.status}`);
      console.log(`   - Response: ${JSON.stringify(response2.data, null, 2)}`);
      
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ SEGUNDO INTENTO CORRECTAMENTE RECHAZADO');
        console.log(`   - Status: ${error.response.status} (Conflict)`);
        console.log(`   - Mensaje: ${error.response.data.message}`);
        console.log(`   - Código: ${error.response.data.code}`);
        
        if (error.response.data.data && error.response.data.data.familia_existente) {
          const familiaExistente = error.response.data.data.familia_existente;
          console.log('   - Familia existente detectada:');
          console.log(`     - ID: ${familiaExistente.id}`);
          console.log(`     - Apellido: ${familiaExistente.apellido}`);
          console.log(`     - Teléfono: ${familiaExistente.telefono}`);
          console.log(`     - Fecha registro: ${familiaExistente.fecha_registro}`);
        }
        console.log('');
        
        console.log('🎉 PRUEBA DE PREVENCIÓN DE DUPLICADOS: EXITOSA');
        console.log('   ✅ Primer intento: Encuesta creada correctamente');
        console.log('   ✅ Segundo intento: Duplicado detectado y rechazado');
        console.log('   ✅ Sistema funcionando como se esperaba');
        
      } else {
        console.log('❌ ERROR INESPERADO en segundo intento:');
        console.log(`   - Status: ${error.response?.status || 'N/A'}`);
        console.log(`   - Mensaje: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ ERROR EN PRIMER INTENTO:');
    console.log(`   - Status: ${error.response?.status || 'N/A'}`);
    console.log(`   - Mensaje: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log(`   - Detalles: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Ejecutar la prueba
testDuplicatePrevention().catch(console.error);
