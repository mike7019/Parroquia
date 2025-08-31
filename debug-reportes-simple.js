const fetch = require('node-fetch');

async function debugReportes() {
  try {
    // Primero autenticar
    console.log('🔑 Autenticando...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.status);
    
    if (loginData.status !== 'success') {
      throw new Error('Login failed');
    }

    const token = loginData.data.accessToken;
    console.log('✅ Token obtenido');

    // Probar endpoint de familias
    console.log('\n📊 Probando reporte de familias...');
    const reporteResponse = await fetch('http://localhost:3000/api/reportes/excel/familias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tipo: 'familias',
        filtros: {
          limit: 5
        }
      })
    });

    console.log('Status:', reporteResponse.status);
    console.log('Status Text:', reporteResponse.statusText);
    
    if (!reporteResponse.ok) {
      const errorText = await reporteResponse.text();
      console.log('Error response:', errorText);
    } else {
      console.log('✅ Reporte generado exitosamente');
      const buffer = await reporteResponse.buffer();
      console.log('Tamaño archivo:', buffer.length, 'bytes');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugReportes();
