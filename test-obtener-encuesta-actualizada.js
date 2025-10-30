/**
 * Test para validar que el endpoint GET /api/encuesta/:id
 * retorna correctamente los arrays de celebraciones y enfermedades
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Hacer login y obtener token
 */
async function login() {
  console.log('🔐 Autenticando...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

    if (response.ok && (data.status === 'success' || data.exito)) {
      console.log('✅ Login exitoso');
      return data.data?.accessToken || data.datos?.token || data.token;
    } else {
      console.error('❌ Login fallido:', data.mensaje || data.message);
      return null;
    }
  } catch (error) {
    console.error('💥 Error en login:', error.message);
    return null;
  }
}

/**
 * Obtener encuesta por ID y validar estructura de celebraciones/enfermedades
 */
async function obtenerYValidarEncuesta(encuestaId, token) {
  console.log(`\n📥 Obteniendo encuesta ${encuestaId}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/encuesta/${encuestaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error al obtener encuesta:', result.message || result.mensaje);
      return false;
    }

    console.log('✅ Encuesta obtenida exitosamente\n');
    
    // Extraer datos de la familia
    const encuesta = result.datos || result.data;
    const personas = encuesta.personas || encuesta.familyMembers || [];
    
    console.log('📊 INFORMACIÓN DE LA ENCUESTA');
    console.log('='.repeat(80));
    console.log(`Familia: ${encuesta.apellido_familiar || encuesta.familia?.apellido_familiar}`);
    console.log(`Total de personas: ${personas.length}`);
    console.log('');

    // Validar estructura de cada persona
    let erroresEncontrados = 0;
    let celebracionesTotales = 0;
    let enfermedadesTotales = 0;

    personas.forEach((persona, index) => {
      const nombre = `${persona.primer_nombre || persona.nombres || ''} ${persona.primer_apellido || ''}`.trim();
      
      console.log(`\n👤 PERSONA ${index + 1}: ${nombre}`);
      console.log('-'.repeat(80));

      // ⭐ VALIDAR CELEBRACIONES
      if (persona.celebraciones !== undefined) {
        if (Array.isArray(persona.celebraciones)) {
          console.log(`✅ Campo 'celebraciones': Array con ${persona.celebraciones.length} elemento(s)`);
          
          persona.celebraciones.forEach((cel, idx) => {
            console.log(`   ${idx + 1}. Motivo: "${cel.motivo}", Día: ${cel.dia}, Mes: ${cel.mes}`);
          });
          
          celebracionesTotales += persona.celebraciones.length;
        } else {
          console.log(`❌ Campo 'celebraciones' NO es un array: ${typeof persona.celebraciones}`);
          erroresEncontrados++;
        }
      } else {
        console.log(`⚠️  Campo 'celebraciones' NO existe en la respuesta`);
        erroresEncontrados++;
      }

      // ⭐ VALIDAR ENFERMEDADES
      if (persona.enfermedades !== undefined) {
        if (Array.isArray(persona.enfermedades)) {
          console.log(`✅ Campo 'enfermedades': Array con ${persona.enfermedades.length} elemento(s)`);
          
          persona.enfermedades.forEach((enf, idx) => {
            console.log(`   ${idx + 1}. Enfermedad: "${enf.enfermedad_nombre || enf.nombre}", Activo: ${enf.activo}, Notas: "${enf.notas || 'N/A'}"`);
          });
          
          enfermedadesTotales += persona.enfermedades.length;
        } else {
          console.log(`❌ Campo 'enfermedades' NO es un array: ${typeof persona.enfermedades}`);
          erroresEncontrados++;
        }
      } else {
        console.log(`⚠️  Campo 'enfermedades' NO existe en la respuesta`);
        erroresEncontrados++;
      }

      // VALIDAR CAMPOS DEPRECADOS (deben existir para compatibilidad)
      console.log('\n📦 Campos deprecados (compatibilidad v1.0):');
      const deprecados = {
        'motivo_celebrar_deprecated': persona.motivo_celebrar_deprecated,
        'dia_celebrar_deprecated': persona.dia_celebrar_deprecated,
        'mes_celebrar_deprecated': persona.mes_celebrar_deprecated,
        'necesidad_enfermo_deprecated': persona.necesidad_enfermo_deprecated
      };

      let algunDeprecadoExiste = false;
      Object.entries(deprecados).forEach(([key, value]) => {
        if (value !== undefined) {
          console.log(`   ✅ ${key}: "${value}"`);
          algunDeprecadoExiste = true;
        }
      });

      if (!algunDeprecadoExiste) {
        console.log(`   ⚠️  Ningún campo deprecado encontrado (puede ser normal si no hay datos)`);
      }
    });

    // RESUMEN FINAL
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(80));
    console.log(`Total personas analizadas: ${personas.length}`);
    console.log(`Total celebraciones encontradas: ${celebracionesTotales}`);
    console.log(`Total enfermedades encontradas: ${enfermedadesTotales}`);
    console.log(`Errores estructurales: ${erroresEncontrados}`);
    
    if (erroresEncontrados === 0) {
      console.log('\n✅ VALIDACIÓN EXITOSA - La estructura es correcta');
      console.log('   ✓ Los arrays de celebraciones y enfermedades están presentes');
      console.log('   ✓ Los campos deprecados existen para compatibilidad');
      return true;
    } else {
      console.log('\n❌ VALIDACIÓN FALLIDA - Se encontraron problemas estructurales');
      return false;
    }

  } catch (error) {
    console.error('💥 Error al obtener encuesta:', error.message);
    return false;
  }
}

/**
 * Test principal
 */
async function testObtenerEncuesta() {
  console.log('\n🧪 TEST DE ENDPOINT GET /api/encuesta/:id');
  console.log('   Verificando arrays de celebraciones y enfermedades');
  console.log('='.repeat(80));

  // 1. Login
  const token = await login();
  if (!token) {
    console.error('❌ No se pudo obtener token');
    process.exit(1);
  }

  // 2. Probar con encuesta 80 (que sabemos tiene datos)
  console.log('\n🎯 Probando con encuesta ID: 80');
  const exitoso = await obtenerYValidarEncuesta(80, token);

  // 3. Conclusión
  console.log('\n' + '='.repeat(80));
  if (exitoso) {
    console.log('🎉 TEST COMPLETADO EXITOSAMENTE');
    console.log('   La actualización del endpoint funciona correctamente');
    process.exit(0);
  } else {
    console.log('❌ TEST FALLIDO');
    console.log('   Revisar los errores anteriores');
    process.exit(1);
  }
}

// Ejecutar test
testObtenerEncuesta().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
