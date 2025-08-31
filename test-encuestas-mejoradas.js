import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';
const LOGIN_URL = `${API_BASE}/auth/login`;
const ENCUESTAS_URL = `${API_BASE}/encuesta`;

// Credenciales de prueba
const credentials = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

async function testEncuestasImproved() {
  console.log('🚀 Iniciando pruebas de encuestas mejoradas...\n');
  
  try {
    // 1. LOGIN
    console.log('🔐 Iniciando sesión...');
    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.accessToken || loginData.datos?.token || loginData.token;
    
    if (!token) {
      console.log('📋 Respuesta del login:', JSON.stringify(loginData, null, 2));
      throw new Error('No se pudo obtener el token de autenticación');
    }
    
    console.log('✅ Login exitoso\n');

    // 2. OBTENER LISTA DE ENCUESTAS
    console.log('📋 Obteniendo lista de encuestas...');
    const listResponse = await fetch(`${ENCUESTAS_URL}?limit=3`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Error obteniendo encuestas: ${listResponse.status} ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    console.log('✅ Lista obtenida exitosamente');
    console.log(`📊 Total de encuestas: ${listData.pagination?.totalItems || 0}`);
    
    if (listData.data && listData.data.length > 0) {
      const primeraEncuesta = listData.data[0];
      console.log('\n📋 Estructura de la primera encuesta:');
      console.log('🆔 ID de encuesta:', primeraEncuesta.id_encuesta);
      console.log('👨‍👩‍👧‍👦 Apellido familiar:', primeraEncuesta.apellido_familiar);
      console.log('🏠 Tipo de vivienda:', JSON.stringify(primeraEncuesta.tipo_vivienda, null, 2));
      console.log('📍 Sector:', JSON.stringify(primeraEncuesta.sector, null, 2));
      console.log('🌍 Municipio:', JSON.stringify(primeraEncuesta.municipio, null, 2));
      
      if (primeraEncuesta.miembros_familia?.personas?.length > 0) {
        const primerMiembro = primeraEncuesta.miembros_familia.personas[0];
        console.log('\n👤 Estructura del primer miembro:');
        console.log('🆔 ID:', primerMiembro.id);
        console.log('👤 Nombre completo:', primerMiembro.nombre_completo);
        console.log('📄 Identificación:', JSON.stringify(primerMiembro.identificacion, null, 2));
        console.log('⚥ Sexo:', JSON.stringify(primerMiembro.sexo, null, 2));
        console.log('💍 Estado civil:', JSON.stringify(primerMiembro.estado_civil, null, 2));
        console.log('👔 Tallas:', JSON.stringify(primerMiembro.tallas, null, 2));
      }

      // 3. OBTENER ENCUESTA ESPECÍFICA
      const encuestaId = primeraEncuesta.id_encuesta;
      console.log(`\n🔍 Obteniendo encuesta específica ID: ${encuestaId}...`);
      
      const detailResponse = await fetch(`${ENCUESTAS_URL}/${encuestaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!detailResponse.ok) {
        throw new Error(`Error obteniendo encuesta ${encuestaId}: ${detailResponse.status} ${detailResponse.statusText}`);
      }

      const detailData = await detailResponse.json();
      console.log('✅ Encuesta específica obtenida exitosamente');
      
      if (detailData.data?.miembros_familia?.personas?.length > 0) {
        const miembroDetallado = detailData.data.miembros_familia.personas[0];
        console.log('\n👤 Información detallada del primer miembro:');
        console.log('🆔 ID:', miembroDetallado.id);
        console.log('📛 Información personal:', JSON.stringify(miembroDetallado.informacion_personal, null, 2));
        console.log('📄 Identificación completa:', JSON.stringify(miembroDetallado.identificacion, null, 2));
        console.log('📊 Demografía:', JSON.stringify(miembroDetallado.demografia, null, 2));
        console.log('💍 Estado civil:', JSON.stringify(miembroDetallado.estado_civil, null, 2));
        console.log('📞 Contacto:', JSON.stringify(miembroDetallado.contacto, null, 2));
        console.log('👔 Tallas:', JSON.stringify(miembroDetallado.tallas, null, 2));
      }

      // 4. VERIFICAR ESTRUCTURA DE RESPUESTA
      console.log('\n🔍 Verificando mejoras implementadas:');
      
      // Verificar eliminación de IDs redundantes
      const hasRedundantIds = 'id' in primeraEncuesta || 'id_familia' in primeraEncuesta;
      console.log('❌ IDs redundantes eliminados:', !hasRedundantIds ? '✅ SÍ' : '❌ NO');
      
      // Verificar estructura de datos de configuración
      const hasProperStructure = 
        primeraEncuesta.tipo_vivienda && typeof primeraEncuesta.tipo_vivienda === 'object' &&
        primeraEncuesta.sector && typeof primeraEncuesta.sector === 'object';
      console.log('🏗️ Estructura mejorada de configuración:', hasProperStructure ? '✅ SÍ' : '❌ NO');
      
      // Verificar datos completos de personas
      const hasCompletePersonData = primeraEncuesta.miembros_familia?.personas?.some(p => 
        p.identificacion && typeof p.identificacion === 'object' &&
        p.sexo && typeof p.sexo === 'object' &&
        p.tallas && typeof p.tallas === 'object'
      );
      console.log('👤 Datos completos de personas:', hasCompletePersonData ? '✅ SÍ' : '❌ NO');

    } else {
      console.log('⚠️ No se encontraron encuestas para probar');
    }

    console.log('\n✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Ejecutar pruebas
testEncuestasImproved();
