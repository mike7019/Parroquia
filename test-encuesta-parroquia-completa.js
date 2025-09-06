// Prueba completa de encuesta con validación de parroquia
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
      console.log('📊 Respuesta completa:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

async function testCrearEncuestaCompleta(token) {
  console.log('\n🧪 === PRUEBA COMPLETA DE ENCUESTA CON PARROQUIA ===\n');

  // Datos de encuesta completos con información geográfica válida
  const encuestaData = {
    informacionGeneral: {
      apellido_familiar: 'Familia Prueba Completa',
      direccion: 'Calle Principal 123, Barrio Central',
      telefono: '3001234567',
      email: 'familia.prueba@example.com',
      municipio: { id: 3, nombre: 'BOGOTÁ' },
      parroquia: { id: 4, nombre: 'La Inmaculada' }, // Usar parroquia que pertenece al municipio 3
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
        nombres: 'María Elena',
        fechaNacimiento: '1985-06-15',
        sexo: { id: 1, nombre: 'Masculino' }, // Usar ID válido
        tipoIdentificacion: { id: 1, nombre: 'Cédula de Ciudadanía' },
        numeroIdentificacion: `99${Date.now().toString().slice(-6)}`,
        situacionCivil: 'Casada',
        telefono: '3001234567',
        estudio: 'Universitario',
        talla: {
          camisa: 'M',
          pantalon: '10',
          calzado: '38'
        }
      },
      {
        nombres: 'Carlos Alberto',
        fechaNacimiento: '1980-03-22',
        sexo: { id: 1, nombre: 'Masculino' },
        tipoIdentificacion: { id: 1, nombre: 'Cédula de Ciudadanía' },
        numeroIdentificacion: `88${Date.now().toString().slice(-6)}`,
        situacionCivil: 'Casado',
        telefono: '3007654321',
        estudio: 'Técnico',
        talla: {
          camisa: 'L',
          pantalon: '32',
          calzado: '42'
        }
      },
      {
        nombres: 'Ana Sofía',
        fechaNacimiento: '2010-09-10',
        sexo: { id: 1, nombre: 'Masculino' }, // Usar ID válido
        tipoIdentificacion: { id: 1, nombre: 'Cédula de Ciudadanía' }, // Usar ID válido
        numeroIdentificacion: `77${Date.now().toString().slice(-6)}`,
        situacionCivil: 'Soltera',
        telefono: '',
        estudio: 'Primaria',
        talla: {
          camisa: 'S',
          pantalon: '8',
          calzado: '35'
        }
      }
    ],
    deceasedMembers: [
      {
        nombres: 'Pedro Antonio',
        fechaAniversario: '2020-12-15',
        eraPadre: true,
        eraMadre: false,
        causaFallecimiento: 'Enfermedad natural'
      }
    ],
    observaciones: {
      sustento_familia: 'Trabajo independiente y empleo formal',
      observaciones_encuestador: 'Familia muy colaborativa, información completa y verificada',
      autorizacion_datos: true
    },
    metadata: {
      completed: true,
      currentStage: 'final',
      timestamp: new Date().toISOString()
    }
  };

  try {
    console.log('📤 Enviando solicitud POST a /api/encuestas...');
    console.log('📋 Datos enviados:', JSON.stringify(encuestaData, null, 2));
    
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
      console.log('\n✅ ¡ENCUESTA CREADA EXITOSAMENTE!');
      console.log('📊 Respuesta del servidor:', JSON.stringify(responseData, null, 2));
      
      const familiaId = responseData.data?.familia_id;
      
      if (familiaId) {
        console.log(`\n🔍 Verificando encuesta creada (ID: ${familiaId})...`);
        await verificarEncuestaCreada(familiaId, token, encuestaData);
      }
      
    } else {
      console.log('\n❌ ERROR AL CREAR ENCUESTA:');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(responseData, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function verificarEncuestaCreada(familiaId, token, datosOriginales) {
  try {
    const response = await fetch(`${API_BASE}/encuestas/${familiaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const encuesta = await response.json();

    if (response.ok && encuesta.status === 'success') {
      console.log('\n🎯 VALIDACIÓN DE DATOS GUARDADOS:');
      console.log('=====================================');
      
      const datos = encuesta.data;
      
      // Validar información básica
      console.log('\n📋 Información básica:');
      console.log('- ID Familia:', datos.id_encuesta);
      console.log('- Apellido:', datos.apellido_familiar);
      console.log('- Teléfono:', datos.telefono);
      console.log('- Email:', datos.email);
      console.log('- Dirección:', datos.direccion_familia);
      
      // Validar información geográfica CRÍTICA
      console.log('\n🌍 Información geográfica guardada:');
      console.log('- Municipio:', datos.municipio?.nombre || '❌ NO GUARDADO');
      console.log('- Parroquia:', datos.parroquia?.nombre || '❌ NO GUARDADO');
      console.log('- Vereda:', datos.vereda?.nombre || '❌ NO GUARDADO');
      console.log('- Sector:', datos.sector?.nombre || '❌ NO GUARDADO');
      
      // VALIDACIÓN ESPECÍFICA DE PARROQUIA
      if (datos.parroquia) {
        if (datos.parroquia.id === datosOriginales.informacionGeneral.parroquia.id && 
            datos.parroquia.nombre === datosOriginales.informacionGeneral.parroquia.nombre) {
          console.log('\n✅ ¡ÉXITO! PARROQUIA GUARDADA CORRECTAMENTE');
          console.log(`   - ID Original: ${datosOriginales.informacionGeneral.parroquia.id}`);
          console.log(`   - ID Guardado: ${datos.parroquia.id}`);
          console.log(`   - Nombre Original: ${datosOriginales.informacionGeneral.parroquia.nombre}`);
          console.log(`   - Nombre Guardado: ${datos.parroquia.nombre}`);
        } else {
          console.log('\n⚠️ ADVERTENCIA: Datos de parroquia no coinciden');
          console.log(`   - Esperado: ID ${datosOriginales.informacionGeneral.parroquia.id}, "${datosOriginales.informacionGeneral.parroquia.nombre}"`);
          console.log(`   - Obtenido: ID ${datos.parroquia.id}, "${datos.parroquia.nombre}"`);
        }
      } else {
        console.log('\n❌ PROBLEMA CRÍTICO: LA PARROQUIA NO SE GUARDÓ');
        console.log(`   - Se envió: ${JSON.stringify(datosOriginales.informacionGeneral.parroquia)}`);
        console.log('   - Se obtuvo: null');
      }
      
      // Validar miembros de familia
      console.log('\n👥 Miembros de familia:');
      console.log(`- Total enviados: ${datosOriginales.familyMembers.length}`);
      console.log(`- Total guardados: ${datos.miembros_familia?.total_miembros || 0}`);
      
      // Validar personas fallecidas
      console.log('\n⚰️ Personas fallecidas:');
      console.log(`- Total enviados: ${datosOriginales.deceasedMembers.length}`);
      console.log(`- Total guardados: ${datos.personas_fallecidas?.total_fallecidos || 0}`);
      
      // Validar servicios
      console.log('\n🏠 Servicios guardados:');
      console.log('- Tipo vivienda:', datos.tipo_vivienda?.nombre || '❌ NO GUARDADO');
      console.log('- Basuras:', datos.basuras?.length > 0 ? `${datos.basuras.length} tipos` : '❌ NO GUARDADO');
      console.log('- Acueducto:', datos.acueducto?.nombre || '❌ NO GUARDADO');
      console.log('- Aguas residuales:', datos.aguas_residuales?.nombre || '❌ NO GUARDADO');
      
      console.log('\n🎯 RESUMEN DE VALIDACIÓN:');
      console.log('==========================');
      
      const validaciones = {
        familia_creada: !!datos.id_encuesta,
        parroquia_guardada: !!datos.parroquia && datos.parroquia.id === datosOriginales.informacionGeneral.parroquia.id,
        municipio_guardado: !!datos.municipio,
        miembros_guardados: datos.miembros_familia?.total_miembros === datosOriginales.familyMembers.length,
        fallecidos_guardados: datos.personas_fallecidas?.total_fallecidos === datosOriginales.deceasedMembers.length,
        servicios_guardados: !!datos.tipo_vivienda && !!datos.acueducto
      };
      
      Object.entries(validaciones).forEach(([key, value]) => {
        console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'CORRECTO' : 'FALLO'}`);
      });
      
      const todoCorrecto = Object.values(validaciones).every(v => v);
      
      if (todoCorrecto) {
        console.log('\n🎉 ¡TODAS LAS VALIDACIONES PASARON EXITOSAMENTE!');
        console.log('🎯 LA PARROQUIA Y TODOS LOS DATOS SE GUARDARON CORRECTAMENTE');
      } else {
        console.log('\n⚠️ ALGUNAS VALIDACIONES FALLARON');
        console.log('🔧 Revisar el código de creación de encuestas');
      }
      
    } else {
      console.log('\n❌ Error al consultar la encuesta creada:', encuesta.message || 'Error desconocido');
    }

  } catch (error) {
    console.error('\n❌ Error verificando encuesta:', error.message);
  }
}

// Ejecutar prueba completa
async function ejecutarPruebaCompleta() {
  try {
    console.log('🚀 INICIANDO PRUEBA COMPLETA DE ENCUESTA CON PARROQUIA');
    console.log('=======================================================\n');
    
    const token = await login();
    if (token) {
      await testCrearEncuestaCompleta(token);
    } else {
      console.log('❌ No se pudo obtener token de autenticación');
    }
  } catch (error) {
    console.error('❌ Error general en la prueba:', error.message);
  }
  
  console.log('\n🏁 PRUEBA COMPLETADA');
  console.log('====================');
}

// Ejecutar inmediatamente
ejecutarPruebaCompleta();
