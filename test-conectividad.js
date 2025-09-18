// Script simple para verificar conectividad del servidor
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function verificarConectividad() {
  try {
    console.log('🔗 Verificando conectividad con:', API_BASE);
    
    // Probar health endpoint
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
    
    // Probar endpoint de encuestas sin autenticación (debería dar 401)
    console.log('\n🔍 Probando endpoint de encuestas...');
    const encuestaResponse = await fetch(`${API_BASE}/encuesta`);
    console.log('📋 Status:', encuestaResponse.status);
    console.log('📋 Status Text:', encuestaResponse.statusText);
    
    if (encuestaResponse.status === 401) {
      console.log('✅ Endpoint de encuestas existe (requiere autenticación)');
    } else {
      const data = await encuestaResponse.json();
      console.log('📋 Respuesta:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

verificarConectividad();