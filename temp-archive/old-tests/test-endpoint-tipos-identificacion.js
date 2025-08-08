import fetch from 'node-fetch';

async function testTiposIdentificacion() {
  try {
    console.log('🔍 Probando endpoint de tipos de identificación...\n');
    
    const response = await fetch('http://localhost:3000/api/catalog/tipos-identificacion');
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('\n📄 Response Body (raw):');
    console.log(data);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n✅ JSON Response:');
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log('\n❌ Error parsing JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTiposIdentificacion();
