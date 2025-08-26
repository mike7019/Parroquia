// Script para probar el endpoint de encuesta con datos reales
import fetch from 'node-fetch';

const URL_BASE = 'http://localhost:3000';

async function probarEndpointEncuesta() {
  try {
    console.log('🧪 Probando endpoint POST /api/encuesta...\n');
    
    // Datos de prueba que simulan lo que envía el frontend
    const encuestaTest = {
      informacionGeneral: {
        municipio: { id: '1', nombre: 'Medellín' },
        parroquia: { id: '1', nombre: 'San José' },
        sector: { id: '1', nombre: 'Centro' },
        vereda: { id: '1', nombre: 'El Carmen' },
        fecha: '2025-08-24T04:30:00.000Z',
        apellido_familiar: 'FAMILIA_TEST_API',
        direccion: 'Calle de Prueba 123',
        telefono: '6041234567',
        numero_contrato_epm: '987654321'
      },
      vivienda: {
        tipo_vivienda: { id: '1', nombre: 'Casa' },
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
        sistema_acueducto: { id: '1', nombre: 'Aguas de Medellín' },
        aguas_residuales: 'Alcantarillado público',
        pozo_septico: false,
        letrina: false,
        campo_abierto: false
      },
      observaciones: {
        sustento_familia: 'Agricultura',
        observaciones_encuestador: 'Familia con acceso a servicios básicos',
        autorizacion_datos: true
      },
      familyMembers: [
        {
          nombres: 'Juan Carlos',
          apellidos: 'Test Apellido',
          fecha_nacimiento: '1990-01-01',
          identificacion: '12345678',
          tipo_identificacion: 'CC',
          sexo: 'M',
          estado_civil: 'Soltero',
          parentesco: 'Jefe de Hogar',
          nivel_educativo: 'Universitario',
          profesion: 'Ingeniero',
          comunidad_cultural: 'Mestizo'
        }
      ],
      deceasedMembers: [],
      metadata: {
        timestamp: '2025-08-24T04:30:00.000Z',
        completed: true,
        currentStage: 1
      }
    };
    
    console.log('📋 Datos de encuesta a enviar:');
    console.log(JSON.stringify(encuestaTest, null, 2));
    
    console.log('\n🚀 Enviando solicitud POST...');
    
    const response = await fetch(`${URL_BASE}/api/encuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(encuestaTest)
    });
    
    const responseData = await response.json();
    
    console.log('\n📊 Respuesta del servidor:');
    console.log(`Status: ${response.status}`);
    console.log('Data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ ÉXITO: La encuesta se procesó correctamente');
    } else {
      console.log('\n❌ ERROR: La encuesta falló');
      if (responseData.details) {
        console.log('Detalles del error:', responseData.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

probarEndpointEncuesta();
