import fetch from 'node-fetch';

async function consultarEncuesta5() {
  try {
    console.log('🔍 Consultando encuesta ID 5 en localhost:3000...\n');
    
    // Primero verificar en la base de datos
    const { QueryTypes } = await import('sequelize');
    const { default: sequelize } = await import('../config/sequelize.js');
    
    const [familia] = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_centro_poblado,
        cp.nombre as nombre_centro_poblado
      FROM familias f
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      WHERE f.id_familia = 5
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('📊 DATOS EN LA BASE DE DATOS:');
    if (!familia) {
      console.log('   ❌ No existe la familia con ID 5\n');
    } else {
      console.log('   Familia:', familia.apellido_familiar);
      console.log('   ID Centro Poblado:', familia.id_centro_poblado || 'NULL');
      console.log('   Nombre Centro Poblado:', familia.nombre_centro_poblado || 'NULL');
      console.log('');
    }
    
    await sequelize.close();
    
    // Ahora consultar el API
    console.log('🌐 CONSULTANDO EL API:');
    console.log('   URL: http://localhost:3000/api/encuesta/5\n');
    
    const response = await fetch('http://localhost:3000/api/encuesta/5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log('   Respuesta:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('📦 RESPUESTA DEL API:');
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
    
    if (data.data) {
      console.log('\n   🏠 Información de la familia:');
      console.log('   ID Encuesta:', data.data.id_encuesta);
      console.log('   Apellido:', data.data.apellido_familiar);
      console.log('   Centro Poblado:', JSON.stringify(data.data.centro_poblado, null, 2));
      console.log('   Corregimiento:', JSON.stringify(data.data.corregimiento, null, 2));
      
      if (data.data.centro_poblado === null) {
        console.log('\n   ⚠️  PROBLEMA CONFIRMADO: centro_poblado es NULL en el API');
        console.log('   Pero en la BD existe. El código no está procesando correctamente.');
      } else {
        console.log('\n   ✅ Centro poblado se está devolviendo correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

consultarEncuesta5();
