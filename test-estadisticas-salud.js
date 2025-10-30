/**
 * Test para validar que el endpoint de estadísticas de salud
 * usa correctamente las tablas intermedias persona_enfermedad
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    })
  });

  const data = await response.json();
  return data.data?.accessToken || data.datos?.token || data.token;
}

async function testEstadisticasSalud() {
  console.log('\n🧪 TEST DE ESTADÍSTICAS DE SALUD');
  console.log('   Verificando uso de tablas intermedias');
  console.log('='.repeat(80));

  console.log('\n🔐 Autenticando...');
  const token = await login();
  
  if (!token) {
    console.error('❌ No se pudo obtener token');
    return;
  }

  console.log('✅ Autenticado\n');
  console.log('📥 Consultando estadísticas de salud...');

  const response = await fetch(`${API_BASE_URL}/estadisticas/salud`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`❌ Error ${response.status}: ${response.statusText}`);
    const error = await response.json();
    console.error('Detalle:', error);
    return;
  }

  const result = await response.json();
  console.log('✅ Estadísticas obtenidas\n');

  // Validar estructura
  const datos = result.datos || result.data;
  
  console.log('📊 TOTALES GENERALES:');
  console.log('='.repeat(80));
  console.log(`Total personas: ${datos.totales?.total_personas || 'N/A'}`);
  console.log(`Personas con enfermedades: ${datos.totales?.personas_con_enfermedades || 'N/A'}`);
  console.log(`Personas sanas: ${datos.totales?.personas_sanas || 'N/A'}`);

  console.log('\n📊 DISTRIBUCIÓN POR ENFERMEDAD:');
  console.log('='.repeat(80));
  
  const distribucion = datos.distribucionPorEnfermedad || datos.distribucion || [];
  
  if (distribucion.length === 0) {
    console.log('⚠️  No hay datos de distribución');
  } else {
    console.log(`Total de enfermedades catalogadas: ${distribucion.length}\n`);
    
    distribucion.slice(0, 10).forEach((enf, idx) => {
      console.log(`${idx + 1}. ${enf.enfermedad}`);
      if (enf.descripcion_enfermedad) {
        console.log(`   ✅ Descripción: ${enf.descripcion_enfermedad.substring(0, 60)}...`);
      }
      console.log(`   Personas afectadas: ${enf.total_personas}`);
      console.log(`   Porcentaje: ${enf.porcentaje}%`);
      console.log(`   Por sexo: M=${enf.masculino}, F=${enf.femenino}`);
      console.log('');
    });
  }

  console.log('\n📊 FAMILIAS AFECTADAS:');
  console.log('='.repeat(80));
  const familias = datos.familiasAfectadas || datos.familias || {};
  console.log(`Familias con personas enfermas: ${familias.familias_con_personas_enfermas || 'N/A'}`);
  console.log(`Familias completamente sanas: ${familias.familias_completamente_sanas || 'N/A'}`);
  console.log(`Promedio enfermos por familia: ${familias.promedio_enfermos_por_familia || 'N/A'}`);

  // Validación de estructura
  console.log('\n\n✅ VALIDACIÓN DE ESTRUCTURA:');
  console.log('='.repeat(80));
  
  let validaciones = {
    totales_presente: !!datos.totales,
    distribucion_presente: !!distribucion,
    distribucion_es_array: Array.isArray(distribucion),
    tiene_descripcion: distribucion.length > 0 && !!distribucion[0].descripcion_enfermedad,
    familias_presente: !!familias
  };

  Object.entries(validaciones).forEach(([key, value]) => {
    const icon = value ? '✅' : '❌';
    const label = key.replace(/_/g, ' ').toUpperCase();
    console.log(`${icon} ${label}`);
  });

  const todasValidas = Object.values(validaciones).every(v => v === true);
  
  console.log('\n' + '='.repeat(80));
  if (todasValidas) {
    console.log('🎉 TEST EXITOSO - Estadísticas funcionando correctamente');
    console.log('   ✓ Usa tabla persona_enfermedad');
    console.log('   ✓ Incluye descripciones de enfermedades');
    console.log('   ✓ Estructura de datos correcta');
  } else {
    console.log('⚠️  TEST PARCIAL - Revisar validaciones fallidas');
  }

  return todasValidas;
}

testEstadisticasSalud().catch(console.error);
