#!/usr/bin/env node

/**
 * Script de prueba para el seeder dinámico de departamentos
 * Prueba la consulta a la API de Colombia y el mapeo de datos
 */

async function testAPICall() {
  console.log('🧪 Probando consulta directa a la API de Colombia...\n');
  
  try {
    console.log('🌐 Haciendo solicitud a: https://api-colombia.com/api/v1/Department');
    
    const response = await fetch('https://api-colombia.com/api/v1/Department', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Parroquia-Management-System/1.0'
      }
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📊 Recibidos ${data.length} departamentos`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Primeros 5 departamentos:');
    data.slice(0, 5).forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.name} (ID: ${dept.id})`);
    });

    // Ordenar alfabéticamente como lo hace el seeder
    const sorted = data
      .map(dept => dept.name)
      .sort((a, b) => a.localeCompare(b));
    
    console.log('\n🔤 Primeros 5 en orden alfabético:');
    sorted.slice(0, 5).forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    console.log('\n✅ Prueba de API exitosa!');
    return data;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

testAPICall();
