// Test para verificar que el id_parroquia se guarda correctamente al crear encuesta
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

// Token de autenticación (reemplaza con uno válido)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTcwMjQzMDAsImV4cCI6MTc1NzAyNzkwMH0.QH6VQPpgfLXMGPx8N2_s8YcyLYRZojnKlKtJ4UH8Tws';

async function testCrearEncuestaConParroquia() {
  console.log('🧪 Iniciando prueba de creación de encuesta con parroquia...\n');

  // Datos de prueba con parroquia incluida
  const encuestaData = {
    informacionGeneral: {
      apellido_familiar: 'Familia Test Parroquia',
      direccion: 'Calle Test 123',
      telefono: '3001234567',
      email: 'test@parroquia.com',
      municipio: { id: 1, nombre: 'Pitalito' },
      parroquia: { id: 1, nombre: 'San José' }, // ¡Incluimos parroquia!
      vereda: { id: 1, nombre: 'Centro' },
      sector: { id: 1, nombre: 'Sector Central' },
      comunionEnCasa: true
    },
    vivienda: {
      tipo_vivienda: { id: 1, nombre: 'Casa' },
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
      sistema_acueducto: { id: 1, nombre: 'Acueducto Público' },
      aguas_residuales: { id: 1, nombre: 'Alcantarillado' }
    },
    familyMembers: [
      {
        nombre: 'Juan Carlos',
        apellido: 'Test Parroquia',
        tipo_identificacion: { id: 1, nombre: 'Cédula de Ciudadanía' },
        numero_identificacion: '12345678',
        fecha_nacimiento: '1985-06-15',
        sexo: { id: 1, nombre: 'Masculino' },
        estado_civil: 'Soltero',
        nivel_estudios: 'Universitario',
        ocupacion: 'Ingeniero',
        telefono: '3001234567',
        email: 'juan@test.com',
        es_jefe_hogar: true,
        discapacidad: false,
        tipo_discapacidad: null,
        regimen_salud: 'Contributivo',
        embarazada: false,
        grupo_poblacional: 'Ninguno'
      }
    ],
    deceasedMembers: [],
    observaciones: {
      sustento_familia: 'Trabajo independiente',
      observaciones_encuestador: 'Familia colaborativa en la prueba',
      autorizacion_datos: true
    },
    metadata: {
      completed: true,
      currentStage: 'final'
    }
  };

  try {
    console.log('📤 Enviando solicitud POST a /api/encuestas...');
    
    const response = await fetch(`${API_BASE}/encuestas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(encuestaData)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Encuesta creada exitosamente!');
      console.log('📊 Datos de respuesta:', JSON.stringify(responseData, null, 2));
      
      const familiaId = responseData.data?.familia_id;
      
      if (familiaId) {
        // Ahora verificamos si la parroquia se guardó correctamente
        console.log(`\n🔍 Verificando si la parroquia se guardó para familia ID: ${familiaId}`);
        await verificarParroquiaGuardada(familiaId);
      }
      
    } else {
      console.log('❌ Error al crear encuesta:');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

async function verificarParroquiaGuardada(familiaId) {
  try {
    // Consultamos la encuesta creada para verificar la parroquia
    const response = await fetch(`${API_BASE}/encuestas/${familiaId}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    const encuesta = await response.json();

    if (response.ok && encuesta.exito) {
      console.log('📋 Datos de la encuesta consultada:');
      console.log('- ID Familia:', encuesta.datos.id_familia);
      console.log('- Apellido:', encuesta.datos.apellido_familiar);
      
      // Verificamos la información geográfica
      const geografia = encuesta.datos.informacion_geografica;
      if (geografia) {
        console.log('\n🌍 Información geográfica guardada:');
        console.log('- Municipio:', geografia.municipio?.nombre || 'No definido');
        console.log('- Parroquia:', geografia.parroquia?.nombre || 'No definido');
        console.log('- Vereda:', geografia.vereda?.nombre || 'No definido');
        console.log('- Sector:', geografia.sector?.nombre || 'No definido');
        
        if (geografia.parroquia && geografia.parroquia.nombre === 'San José') {
          console.log('\n✅ ¡ÉXITO! La parroquia se guardó correctamente');
          console.log('   - ID Parroquia:', geografia.parroquia.id);
          console.log('   - Nombre Parroquia:', geografia.parroquia.nombre);
        } else {
          console.log('\n❌ PROBLEMA: La parroquia no se guardó o no se está devolviendo correctamente');
        }
      } else {
        console.log('\n❌ No se encontró información geográfica en la respuesta');
      }
      
    } else {
      console.log('❌ Error al consultar la encuesta creada:', encuesta.mensaje || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error verificando parroquia guardada:', error.message);
  }
}

// Ejecutar la prueba
testCrearEncuestaConParroquia().then(() => {
  console.log('\n🏁 Prueba completada');
}).catch(console.error);
