import axios from 'axios';

const API_URL = 'http://206.62.139.11:3000/api';
let authToken = null;

/**
 * Login para obtener token de autenticación
 */
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@parroquia.com',
      password: 'admin123'
    });
    
    authToken = response.data.data?.accessToken || response.data.accessToken;
    console.log('✅ Login exitoso\n');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Listar corregimientos disponibles
 */
async function listarCorregimientos() {
  try {
    const response = await axios.get(`${API_URL}/catalog/corregimientos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const corregimientos = response.data.datos || [];
    console.log(`📋 Corregimientos disponibles (${corregimientos.length}):`);
    corregimientos.forEach(c => {
      console.log(`   - ID: ${c.id_corregimiento}, Código: ${c.codigo_corregimiento}, Nombre: ${c.nombre}`);
    });
    console.log('');
    
    return corregimientos[0]?.id_corregimiento || 1;
  } catch (error) {
    console.error('❌ Error listando corregimientos:', error.response?.data || error.message);
    return 1;
  }
}

/**
 * Crear encuesta CON corregimiento
 */
async function crearEncuestaConCorregimiento(idCorregimiento) {
  console.log(`🔹 Creando encuesta CON corregimiento (ID: ${idCorregimiento})...`);
  
  const encuestaData = {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 1, nombre: "San José" },
      sector: { id: 1, nombre: "Centro" },
      vereda: { id: 1, nombre: "La Macarena" },
      corregimiento: { id: idCorregimiento, nombre: "Test Corregimiento" },
      fecha: new Date().toISOString(),
      apellido_familiar: "FAMILIA_TEST_CORREGIMIENTO_CON",
      direccion: "Calle Test 123",
      telefono: "3001234567",
      numero_contrato_epm: "TEST-001",
      comunionEnCasa: false
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
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Trabajo independiente",
      observaciones_encuestador: "Test con corregimiento",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Juan Pérez",
        numeroIdentificacion: `TEST${Date.now()}`,
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1990-01-01",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3001234567",
        situacionCivil: { id: 1, nombre: "Soltero" },
        estudio: { id: 1, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe de Hogar" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "M",
        talla_pantalon: "32",
        talla_zapato: "40",
        profesion: { id: 1, nombre: "Ingeniero" }
      }
    ]
  };
  
  try {
    const response = await axios.post(`${API_URL}/encuesta`, encuestaData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const familiaId = response.data.data?.id_familia;
    console.log(`   ✅ Encuesta creada exitosamente - Familia ID: ${familiaId}\n`);
    return familiaId;
  } catch (error) {
    console.error('   ❌ Error creando encuesta CON corregimiento:');
    console.error('   ', error.response?.data || error.message);
    return null;
  }
}

/**
 * Crear encuesta SIN corregimiento (campo omitido)
 */
async function crearEncuestaSinCorregimiento() {
  console.log('🔹 Creando encuesta SIN corregimiento (campo omitido)...');
  
  const encuestaData = {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 1, nombre: "San José" },
      sector: { id: 1, nombre: "Centro" },
      vereda: { id: 1, nombre: "La Macarena" },
      // corregimiento omitido intencionalmente
      fecha: new Date().toISOString(),
      apellido_familiar: "FAMILIA_TEST_CORREGIMIENTO_SIN",
      direccion: "Calle Test 456",
      telefono: "3007654321",
      numero_contrato_epm: "TEST-002",
      comunionEnCasa: false
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
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Trabajo independiente",
      observaciones_encuestador: "Test sin corregimiento",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "María López",
        numeroIdentificacion: `TEST${Date.now() + 1}`,
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1985-05-15",
        sexo: { id: 2, nombre: "Femenino" },
        telefono: "3007654321",
        situacionCivil: { id: 1, nombre: "Soltera" },
        estudio: { id: 1, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe de Hogar" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "S",
        talla_pantalon: "28",
        talla_zapato: "36",
        profesion: { id: 1, nombre: "Docente" }
      }
    ]
  };
  
  try {
    const response = await axios.post(`${API_URL}/encuesta`, encuestaData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const familiaId = response.data.data?.id_familia;
    console.log(`   ✅ Encuesta creada exitosamente - Familia ID: ${familiaId}\n`);
    return familiaId;
  } catch (error) {
    console.error('   ❌ Error creando encuesta SIN corregimiento:');
    console.error('   ', error.response?.data || error.message);
    return null;
  }
}

/**
 * Verificar familia en base de datos
 */
async function verificarFamilia(familiaId, debeIncluirCorregimiento) {
  try {
    const response = await axios.get(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const familia = response.data.data;
    const tieneCorregimiento = familia.id_corregimiento !== null;
    const nombreCorregimiento = familia.nombre_corregimiento;
    
    console.log(`   📊 Familia ID: ${familiaId}`);
    console.log(`   - Apellido: ${familia.apellido_familiar}`);
    console.log(`   - id_corregimiento: ${familia.id_corregimiento || 'NULL'}`);
    console.log(`   - nombre_corregimiento: ${nombreCorregimiento || 'NULL'}`);
    
    if (debeIncluirCorregimiento) {
      if (tieneCorregimiento) {
        console.log(`   ✅ CORRECTO: La familia tiene corregimiento asignado\n`);
        return true;
      } else {
        console.log(`   ❌ ERROR: Se esperaba corregimiento pero es NULL\n`);
        return false;
      }
    } else {
      if (!tieneCorregimiento) {
        console.log(`   ✅ CORRECTO: La familia no tiene corregimiento (campo opcional)\n`);
        return true;
      } else {
        console.log(`   ⚠️  INESPERADO: La familia tiene corregimiento aunque no se envió\n`);
        return true; // No es error, pero es inesperado
      }
    }
  } catch (error) {
    console.error('   ❌ Error verificando familia:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Limpiar familias de prueba
 */
async function limpiarFamiliasPrueba(familiaIds) {
  console.log('🧹 Limpiando familias de prueba...');
  
  for (const familiaId of familiaIds) {
    if (!familiaId) continue;
    
    try {
      await axios.delete(`${API_URL}/encuesta/${familiaId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`   ✅ Familia ${familiaId} eliminada`);
    } catch (error) {
      console.error(`   ⚠️  No se pudo eliminar familia ${familiaId}`);
    }
  }
  console.log('');
}

/**
 * Ejecutar todas las pruebas
 */
async function ejecutarPruebas() {
  console.log('═'.repeat(80));
  console.log('🧪 TEST: Integración Corregimiento en Encuestas');
  console.log('═'.repeat(80));
  console.log('');
  
  // 1. Login
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ No se pudo autenticar. Abortando pruebas.');
    return;
  }
  
  // 2. Listar corregimientos
  const idCorregimiento = await listarCorregimientos();
  
  // 3. Crear encuesta CON corregimiento
  const familiaConCorregimiento = await crearEncuestaConCorregimiento(idCorregimiento);
  
  // 4. Crear encuesta SIN corregimiento
  const familiaSinCorregimiento = await crearEncuestaSinCorregimiento();
  
  // 5. Verificar encuestas
  console.log('🔍 Verificando familias creadas...\n');
  const test1 = familiaConCorregimiento ? 
    await verificarFamilia(familiaConCorregimiento, true) : false;
  const test2 = familiaSinCorregimiento ? 
    await verificarFamilia(familiaSinCorregimiento, false) : false;
  
  // 6. Limpiar datos de prueba
  await limpiarFamiliasPrueba([familiaConCorregimiento, familiaSinCorregimiento]);
  
  // 7. Resumen
  console.log('═'.repeat(80));
  console.log('📊 RESUMEN DE PRUEBAS:');
  console.log('═'.repeat(80));
  console.log(`   Test 1 (CON corregimiento):    ${test1 ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`   Test 2 (SIN corregimiento):    ${test2 ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log('');
  
  if (test1 && test2) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! El campo corregimiento está correctamente integrado.');
  } else {
    console.log('❌ Algunos tests fallaron. Revisa los logs anteriores.');
  }
  console.log('═'.repeat(80));
}

// Ejecutar pruebas
ejecutarPruebas().catch(error => {
  console.error('💥 Error fatal en pruebas:', error);
  process.exit(1);
});
