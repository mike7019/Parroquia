import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

(async () => {
  try {
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.accessToken;
    
    // Obtener lista de encuestas para sacar un ID válido
    const listRes = await fetch(`${BASE_URL}/api/encuesta?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const listData = await listRes.json();
    console.log('\n📋 Lista de encuestas:');
    console.log(JSON.stringify(listData, null, 2));
    
    if (listData.data && listData.data.length > 0) {
      const firstId = listData.data[0].id_encuesta || listData.data[0].id_familia || listData.data[0].id;
      console.log(`\n🔍 Probando GET con ID específico: ${firstId}`);
      
      const detailRes = await fetch(`${BASE_URL}/api/encuesta/${firstId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`Status: ${detailRes.status} ${detailRes.statusText}`);
      
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        console.log('\n✅ Encuesta obtenida exitosamente');
        console.log(`ID Familia: ${detailData.data?.id_familia}`);
      } else {
        const errorText = await detailRes.text();
        console.log('\n❌ Error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
