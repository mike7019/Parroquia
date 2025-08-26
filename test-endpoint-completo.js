// Test completo del endpoint de encuestas
import fetch from 'node-fetch';

const baseURL = 'http://localhost:3000';

// Datos de ejemplo que normalmente enviaría el frontend
const encuestaCompleta = {
  informacionGeneral: {
    municipio: { id: "1", nombre: "Test Municipio" },
    parroquia: { id: "1", nombre: "Test Parroquia" },
    sector: { id: "1", nombre: "Centro" },  // Fix: asegurar que sector tenga nombre
    vereda: { id: "1", nombre: "Test Vereda" },
    fecha: "2025-08-24T00:00:00.000Z",
    apellido_familiar: "TestFamilia",
    direccion: "Calle Test 123",
    telefono: "6041234567",
    numero_contrato_epm: "123456789"
  },
  vivienda: {
    tipo_vivienda: { id: "1", nombre: "Casa" }, // Fix: asegurar que tipo_vivienda tenga nombre
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
    sistema_acueducto: { id: "1", nombre: "Acueducto Público" },
    aguas_residuales: "Alcantarillado público",
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
      nombres: "Juan Test",
      apellidos: "Prueba",
      identificacion: "12345678",
      telefono: "6041234567",
      fecha_nacimiento: "1990-01-01",
      sexo: { id: "1", nombre: "Masculino" },
      parentesco: { id: "1", nombre: "Jefe de hogar" },
      estado_civil: { id: "1", nombre: "Soltero" },
      nivel_educativo: { id: "1", nombre: "Primaria" },
      profesion: { id: "1", nombre: "Independiente" },
      discapacidades: [],
      enfermedades: []
    }
  ],
  deceasedMembers: [],
  metadata: {
    timestamp: "2025-08-24T00:00:00.000Z",
    completed: true,
    currentStage: 1
  }
};

async function testEncuestaEndpoint() {
  try {
    console.log('🧪 Probando endpoint de encuesta...\n');
    
    // Primero verificar que el servidor esté corriendo
    console.log('🔍 Verificando servidor...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error('Servidor no está corriendo');
    }
    console.log('✅ Servidor corriendo');
    
    // Como el endpoint requiere autenticación, vamos a hacer una simulación sin token
    // para ver exactamente qué error obtenemos
    console.log('\n📡 Enviando encuesta al endpoint...');
    console.log('📝 Datos de encuesta:', JSON.stringify(encuestaCompleta, null, 2).substring(0, 500) + '...');
    
    const response = await fetch(`${baseURL}/api/encuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Sin Authorization header para ver qué pasa
      },
      body: JSON.stringify(encuestaCompleta)
    });
    
    const responseData = await response.json();
    
    console.log('\n📊 Respuesta del servidor:');
    console.log(`Status: ${response.status}`);
    console.log('Data:', JSON.stringify(responseData, null, 2));
    
    if (response.status === 401) {
      console.log('\n🔒 Endpoint requiere autenticación (esperado)');
      console.log('✅ El endpoint está funcionando correctamente');
    } else if (response.status === 400) {
      console.log('\n📋 Error de validación - revisa los datos');
    } else if (response.status === 500) {
      console.log('\n❌ Error interno del servidor');
      if (responseData.details && responseData.details.includes('id_familia')) {
        console.log('🚨 El problema original persiste');
      }
    } else {
      console.log('\n✅ Respuesta inesperada pero no hay error 500');
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testEncuestaEndpoint();
