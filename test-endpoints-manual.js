// Script para probar los endpoints de sectores
import fetch from 'node-fetch';

async function testSectorEndpoints() {
  try {
    console.log('🧪 Probando endpoints de sectores...\n');
    
    // Primero intentar obtener sectores sin autenticación para ver el error
    console.log('1. Probando GET /api/catalog/sectors sin token...');
    try {
      const response = await fetch('http://localhost:3000/api/catalog/sectors');
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.log('Error esperado:', error.message);
    }
    
    // Probar con la documentación Swagger
    console.log('\n2. Probando GET /api/docs para ver la documentación...');
    try {
      const docsResponse = await fetch('http://localhost:3000/api/docs');
      console.log('Swagger docs status:', docsResponse.status);
      if (docsResponse.status === 200) {
        console.log('✅ Documentación Swagger disponible en: http://localhost:3000/api/docs');
      }
    } catch (error) {
      console.log('Error accediendo a docs:', error.message);
    }
    
    // Probar endpoint de municipios (probablemente no requiere auth)
    console.log('\n3. Probando GET /api/catalog/municipios...');
    try {
      const municipiosResponse = await fetch('http://localhost:3000/api/catalog/municipios');
      if (municipiosResponse.ok) {
        const municipios = await municipiosResponse.json();
        console.log('✅ Municipios obtenidos:', municipios);
      } else {
        console.log('Status municipios:', municipiosResponse.status);
      }
    } catch (error) {
      console.log('Error municipios:', error.message);
    }
    
    // Intentar crear un sector sin auth para ver la estructura de error
    console.log('\n4. Probando POST /api/catalog/sectors sin auth...');
    try {
      const createResponse = await fetch('http://localhost:3000/api/catalog/sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Sector Test Endpoint',
          id_municipio: 1
        })
      });
      const createData = await createResponse.json();
      console.log('Response POST:', createData);
    } catch (error) {
      console.log('Error esperado en POST:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar pruebas
testSectorEndpoints();
