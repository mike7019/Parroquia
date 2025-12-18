require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://206.62.139.11:3001';

async function testCreateEncuesta() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.datos.accessToken;
    console.log('✅ Login successful\n');

    console.log('📝 Creating test encuesta with observaciones...');
    const encuestaData = {
      informacionGeneral: {
        id_departamento: 1,
        id_municipio: 1,
        id_parroquia: 1,
        id_sector: 1,
        direccion: 'Test Address After PM2 Restart',
        telefono: '3001234567',
        estrato: 2,
        id_tipo_vivienda: 1,
        tenencia_vivienda: 'propia'
      },
      vivienda: {
        numero_habitaciones: 3,
        numero_banos: 1,
        tiene_cocina: true,
        tipo_cocina: 'gas',
        material_pisos: 'cemento',
        material_paredes: 'ladrillo',
        material_techo: 'zinc'
      },
      servicios_agua: {
        agua_consumo_origen: 'acueducto',
        agua_consumo_tratamiento: 'ninguno',
        agua_consumo_almacenamiento: 'tanque',
        disposicion_basura: 'recoleccion'
      },
      observaciones: {
        sustento_familia: '✨ Test AFTER PM2 RESTART - Should save this time!',
        observaciones_encuestador: '🔥 CRITICAL TEST: Model cache cleared, expecting SUCCESS',
        autorizacion_datos: true
      },
      familyMembers: [
        {
          tipo_documento: 'CC',
          numero_documento: '1234567890',
          primer_nombre: 'Test',
          primer_apellido: 'User',
          fecha_nacimiento: '1990-01-01',
          sexo: 'M',
          estado_civil: 'soltero',
          nivel_educativo: 'secundaria',
          ocupacion: 'empleado',
          es_jefe_hogar: true
        }
      ],
      deceasedMembers: [],
      metadata: {
        encuestador: 'System Test',
        fecha_encuesta: new Date().toISOString().split('T')[0]
      }
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/encuesta`,
      encuestaData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('\n✅ Encuesta created successfully!');
    console.log('📊 Response Status:', response.status);
    console.log('🆔 Familia ID:', response.data.datos.familia_id);
    console.log('🆔 Encuesta ID:', response.data.datos.encuesta_id);
    console.log('\n📋 Metadata from response:');
    console.log(JSON.stringify(response.data.datos.metadata || {}, null, 2));
    
    console.log('\n⚠️  IMPORTANT: Now verify in DB if observaciones were saved!');
    console.log(`   Familia ID to check: ${response.data.datos.familia_id}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCreateEncuesta();
