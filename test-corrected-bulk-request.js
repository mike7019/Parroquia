// Test del request body corregido para municipios bulk
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testBulkMunicipiosEndpoint() {
  console.log('🧪 PROBANDO ENDPOINT CORREGIDO DE CREACIÓN MASIVA');
  console.log('='*60);
  
  // Request body CORREGIDO
  const requestBodyCorregido = {
    municipios: [
      "Municipio Test String",  // String simple
      {
        "nombre_municipio": "Bogotá D.C.",
        "codigo_dane": "11001",
        "id_departamento": 1
      }
    ],
    defaultDepartamentoId: 1  // ✅ ESTO ES LO QUE FALTABA
  };
  
  console.log('📤 Request body enviado:');
  console.log(JSON.stringify(requestBodyCorregido, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/catalog/municipios/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nota: En producción necesitarías el token JWT
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify(requestBodyCorregido)
    });
    
    const responseData = await response.json();
    
    console.log(`\n📥 Respuesta (${response.status}):`);
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ ¡Éxito! Request corregido funciona correctamente');
    } else {
      console.log('\n❌ Error en el request:');
      console.log('Status:', response.status);
      console.log('Detalle:', responseData);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en el puerto 3000');
  }
}

// Función para mostrar ejemplos de requests válidos
function mostrarEjemplosCorrectos() {
  console.log('\n📚 EJEMPLOS DE REQUESTS BODY CORRECTOS:');
  console.log('='*50);
  
  console.log('\n1️⃣ Ejemplo con strings y objetos mixtos:');
  const ejemplo1 = {
    municipios: [
      "Municipio Simple 1",
      "Municipio Simple 2", 
      {
        "nombre_municipio": "Municipio Completo",
        "codigo_dane": "99001",
        "id_departamento": 1
      }
    ],
    defaultDepartamentoId: 1
  };
  console.log(JSON.stringify(ejemplo1, null, 2));
  
  console.log('\n2️⃣ Ejemplo solo con objetos (defaultDepartamentoId opcional):');
  const ejemplo2 = {
    municipios: [
      {
        "nombre_municipio": "Medellín",
        "codigo_dane": "05001",
        "id_departamento": 2
      },
      {
        "nombre_municipio": "Cali", 
        "codigo_dane": "76001",
        "id_departamento": 3
      }
    ]
  };
  console.log(JSON.stringify(ejemplo2, null, 2));
  
  console.log('\n3️⃣ Ejemplo solo con strings:');
  const ejemplo3 = {
    municipios: [
      "Municipio A",
      "Municipio B",
      "Municipio C"
    ],
    defaultDepartamentoId: 1
  };
  console.log(JSON.stringify(ejemplo3, null, 2));
}

// Ejecutar ejemplos
mostrarEjemplosCorrectos();
console.log('\n🚀 Ejecutando prueba del endpoint...');
testBulkMunicipiosEndpoint();
