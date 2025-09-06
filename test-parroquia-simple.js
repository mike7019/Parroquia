// Script simplificado para probar la creación de encuesta con parroquia
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function login() {
  console.log('🔐 Obteniendo token de autenticación...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.data && data.data.accessToken) {
      console.log('✅ Token obtenido exitosamente');
      return data.data.accessToken;
    } else {
      console.log('❌ Error al obtener token:', data.message || 'Error desconocido');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

async function testCrearEncuestaConParroquia(token) {
  console.log('🧪 Iniciando prueba de creación de encuesta con parroquia...\n');

  const encuestaData = {
    informacionGeneral: {
      apellido_familiar: 'Familia Prueba Parroquia',
      direccion: 'Calle Test 123',
      telefono: '3001234567',
      email: 'test@parroquia.com',
      municipio: { id: 3, nombre: 'BOGOTÁ' },
      parroquia: { id: 1, nombre: 'San José' }, // ¡Incluimos parroquia!
      vereda: { id: 1, nombre: 'El Alamo' },
      sector: { id: 1, nombre: 'Sector San José' },
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
        nombres: 'Juan Carlos',
        fechaNacimiento: '1985-06-15',
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '98765432',
        sexo: 'Masculino',
        situacionCivil: 'Soltero',
        telefono: '3001234567',
        estudio: 'Universitario',
        talla: {
          camisa: 'M',
          pantalon: '32',
          calzado: '42'
        }
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(encuestaData)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Encuesta creada exitosamente!');
      console.log('📊 ID de familia creada:', responseData.data?.familia_id);
      
      const familiaId = responseData.data?.familia_id;
      
      if (familiaId) {
        // Verificar la encuesta creada
        await verificarEncuestaCreada(familiaId, token);
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

async function verificarEncuestaCreada(familiaId, token) {
  try {
    console.log(`\n🔍 Verificando encuesta creada (ID: ${familiaId})...`);
    
    const response = await fetch(`${API_BASE}/encuestas/${familiaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const encuesta = await response.json();

    if (response.ok && encuesta.exito) {
      console.log('📋 Datos de la encuesta:');
      console.log('- ID Familia:', encuesta.datos.id_familia);
      console.log('- Apellido:', encuesta.datos.apellido_familiar);
      
      const geografia = encuesta.datos.informacion_geografica;
      if (geografia) {
        console.log('\n🌍 Información geográfica:');
        console.log('- Municipio:', geografia.municipio?.nombre || 'No definido');
        console.log('- Parroquia:', geografia.parroquia?.nombre || 'No definido');
        console.log('- Vereda:', geografia.vereda?.nombre || 'No definido');
        console.log('- Sector:', geografia.sector?.nombre || 'No definido');
        
        if (geografia.parroquia && geografia.parroquia.nombre === 'San José') {
          console.log('\n✅ ¡ÉXITO! La parroquia se guardó correctamente');
          console.log('   - ID Parroquia:', geografia.parroquia.id);
          console.log('   - Nombre Parroquia:', geografia.parroquia.nombre);
        } else {
          console.log('\n❌ PROBLEMA: La parroquia no se guardó correctamente');
        }
      } else {
        console.log('\n❌ No se encontró información geográfica');
      }
      
    } else {
      console.log('❌ Error al consultar la encuesta:', encuesta.mensaje || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error verificando encuesta:', error.message);
  }
}

// Ejecutar la prueba completa
async function ejecutarPrueba() {
  try {
    const token = await login();
    if (token) {
      await testCrearEncuestaConParroquia(token);
    } else {
      console.log('❌ No se pudo obtener token de autenticación');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
  
  console.log('\n🏁 Prueba completada');
}

ejecutarPrueba();
