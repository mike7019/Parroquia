// Prueba completa de encuesta basada en el notebook Jupyter
// Este script valida que la información de tipo_vivienda se devuelve correctamente

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Función de login
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
    console.log('📊 Respuesta de login:');
    console.log('  - Status:', response.status);
    console.log('  - Success:', data.exito || data.success);
    
    // Extraer token correctamente
    const token = data.data?.accessToken || data.accessToken || data.token;
    
    if (response.ok && token) {
      console.log('✅ Token obtenido exitosamente');
      return token;
    } else {
      console.log('❌ Error al obtener token:', data.message || 'Error desconocido');
      console.log('  - Data completa:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para consultar encuestas y verificar tipo_vivienda
async function consultarEncuestas(token) {
  console.log('\n📋 Consultando encuestas para verificar tipo_vivienda...');
  
  try {
    const response = await fetch(`${API_BASE}/encuesta?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Consulta exitosa');
      console.log(`  - Total encuestas: ${data.pagination?.totalItems || data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n🏠 Verificando información de tipo_vivienda:');
        
        data.data.forEach((encuesta, index) => {
          console.log(`\nEncuesta ${index + 1} (ID: ${encuesta.id_encuesta}):`);
          console.log(`  - Familia: ${encuesta.apellido_familiar}`);
          console.log(`  - Tipo vivienda:`, JSON.stringify(encuesta.tipo_vivienda, null, 4));
          
          // Verificar si el problema está resuelto
          if (encuesta.tipo_vivienda) {
            if (encuesta.tipo_vivienda.nombre === "1" || encuesta.tipo_vivienda.nombre === "2") {
              console.log('❌ PROBLEMA DETECTADO: tipo_vivienda.nombre es un número en lugar del nombre real');
            } else if (encuesta.tipo_vivienda.nombre && encuesta.tipo_vivienda.nombre !== "1") {
              console.log('✅ PROBLEMA RESUELTO: tipo_vivienda.nombre contiene el nombre real');
            } else if (encuesta.tipo_vivienda.id && !encuesta.tipo_vivienda.nombre) {
              console.log('⚠️  PROBLEMA PARCIAL: Tiene ID pero falta nombre');
            }
          } else {
            console.log('⚠️  Sin información de tipo de vivienda');
          }
        });
        
        return data.data;
      } else {
        console.log('⚠️  No hay encuestas disponibles para probar');
        return [];
      }
    } else {
      console.log('❌ Error en consulta:', response.status, data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error consultando encuestas:', error.message);
    return null;
  }
}

// Función para crear una encuesta de prueba y verificar que se guarda correctamente
async function crearEncuestaPrueba(token) {
  console.log('\n🆕 Creando encuesta de prueba para verificar tipo_vivienda...');
  
  const encuestaData = {
    informacionGeneral: {
      fecha: "2025-09-05",
      apellido_familiar: "PRUEBA_TIPO_VIVIENDA_" + Date.now(),
      direccion: "Calle Prueba Tipo Vivienda 123",
      telefono: "3001234567",
      numero_contrato_epm: "EPM-TEST-001",
      comunionEnCasa: true,
      municipio: {
        id: "3",
        nombre: "BOGOTÁ"
      },
      parroquia: {
        id: "4",
        nombre: "La Inmaculada"
      },
      sector: {
        id: "1",
        nombre: "Centro"
      },
      vereda: {
        id: "1",
        nombre: "Urbana"
      }
    },
    vivienda: {
      tipo_vivienda: {
        id: "2",
        nombre: "Apartamento"
      },
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
      sistema_acueducto: {
        id: "1",
        nombre: "Acueducto Público"
      },
      aguas_residuales: "Alcantarillado",
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Empleado público y comercio",
      observaciones_encuestador: "Familia colaborativa en la prueba",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Juan Carlos",
        fechaNacimiento: "1985-03-15",
        numeroIdentificacion: "TEST" + Date.now(),
        tipoIdentificacion: "CC",
        sexo: "Masculino",
        situacionCivil: "Casado",
        parentesco: "Jefe de Hogar",
        telefono: "3001234567",
        estudio: "Universitario",
        comunidadCultural: "Ninguna",
        talla: {
          camisa: "M",
          pantalon: "32",
          calzado: "42"
        }
      }
    ],
    deceasedMembers: [],
    metadata: {
      timestamp: new Date().toISOString(),
      completed: true,
      currentStage: 5
    }
  };

  try {
    const response = await fetch(`${API_BASE}/encuesta`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(encuestaData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Encuesta creada exitosamente');
      console.log(`  - ID Familia: ${result.data?.familia_id}`);
      console.log(`  - Personas creadas: ${result.data?.personas_creadas}`);
      console.log(`  - Tipo vivienda enviado: ${encuestaData.vivienda.tipo_vivienda.nombre}`);
      
      return result.data?.familia_id;
    } else {
      console.log('❌ Error creando encuesta:', response.status, result.message);
      console.log('  - Detalles:', JSON.stringify(result, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Error creando encuesta:', error.message);
    return null;
  }
}

// Función para consultar una encuesta específica y verificar tipo_vivienda
async function consultarEncuestaEspecifica(token, familiaId) {
  console.log(`\n🔍 Consultando encuesta específica (ID: ${familiaId}) para verificar tipo_vivienda...`);
  
  try {
    const response = await fetch(`${API_BASE}/encuesta/${familiaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Consulta específica exitosa');
      console.log('🏠 Información de tipo_vivienda obtenida:');
      console.log(JSON.stringify(data.data.tipo_vivienda, null, 4));
      
      // Verificar si la corrección funciona
      if (data.data.tipo_vivienda) {
        const tipoVivienda = data.data.tipo_vivienda;
        
        if (tipoVivienda.nombre && tipoVivienda.nombre !== "1" && tipoVivienda.nombre !== "2") {
          console.log('✅ ÉXITO: tipo_vivienda.nombre contiene el nombre real del tipo');
          console.log(`  - Nombre: "${tipoVivienda.nombre}"`);
          console.log(`  - ID: ${tipoVivienda.id}`);
        } else if (tipoVivienda.nombre === "1" || tipoVivienda.nombre === "2") {
          console.log('❌ PROBLEMA PERSISTE: tipo_vivienda.nombre sigue siendo un número');
        } else {
          console.log('⚠️  Estado incierto del tipo_vivienda');
        }
      } else {
        console.log('⚠️  No hay información de tipo_vivienda en la respuesta');
      }
      
      return data.data;
    } else {
      console.log('❌ Error en consulta específica:', response.status, data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error consultando encuesta específica:', error.message);
    return null;
  }
}

// Función principal de prueba
async function ejecutarPruebaCompleta() {
  console.log('🚀 INICIANDO PRUEBA COMPLETA DE TIPO_VIVIENDA\n');
  console.log('=' * 60);
  
  try {
    // 1. Login
    const token = await login();
    if (!token) {
      console.log('❌ No se pudo obtener token. Abortando prueba.');
      return;
    }
    
    // 2. Consultar encuestas existentes
    const encuestasExistentes = await consultarEncuestas(token);
    
    // 3. Crear nueva encuesta para probar
    const nuevaFamiliaId = await crearEncuestaPrueba(token);
    
    // 4. Si se creó la encuesta, consultarla específicamente
    if (nuevaFamiliaId) {
      await consultarEncuestaEspecifica(token, nuevaFamiliaId);
    }
    
    // 5. Consultar encuestas nuevamente para ver cambios
    console.log('\n🔄 Consultando encuestas nuevamente para verificar cambios...');
    await consultarEncuestas(token);
    
    console.log('\n✅ PRUEBA COMPLETA FINALIZADA');
    console.log('=' * 60);
    
  } catch (error) {
    console.error('❌ Error en prueba completa:', error);
  }
}

// Ejecutar la prueba
ejecutarPruebaCompleta().catch(console.error);
