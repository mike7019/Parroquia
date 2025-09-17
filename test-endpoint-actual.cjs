// Test rápido del endpoint actual /api/familias/excel
const http = require('http');
const fs = require('fs');

async function testEndpointActual() {
  console.log('🧪 Probando endpoint actual /api/familias/excel...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/familias/excel',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      if (res.statusCode === 200) {
        console.log('✅ Endpoint actual funciona correctamente');
        console.log(`📄 Content-Type: ${res.headers['content-type']}`);
        resolve(true);
      } else {
        console.log(`❌ Error: Status ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Response:', data);
          resolve(false);
        });
      }
    });

    req.on('error', (e) => {
      console.error(`❌ Error de conexión: ${e.message}`);
      reject(e);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Timeout - servidor no responde');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Ejecutar test
testEndpointActual()
  .then(success => {
    if (success) {
      console.log('🎉 Validación del servidor completada exitosamente');
      process.exit(0);
    } else {
      console.log('⚠️ Hay problemas con el endpoint actual');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error en la prueba:', error.message);
    process.exit(1);
  });