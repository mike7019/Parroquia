// Test simple usando fetch nativo de Node.js
const testEncuestas = async () => {
  try {
    console.log('🧪 Probando endpoint de encuestas...');
    
    const response = await fetch('http://localhost:3000/api/encuestas', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTcwMjQzMDAsImV4cCI6MTc1NzAyNzkwMH0.QH6VQPpgfLXMGPx8N2_s8YcyLYRZojnKlKtJ4UH8Tws',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data.message);
      console.log('📊 Total encuestas:', data.data.length);
      
      // Verificar datos nulos
      let nullAcueductos = 0;
      let nullAguasResiduales = 0;
      
      data.data.forEach(familia => {
        if (familia.acueducto === null) nullAcueductos++;
        if (familia.aguas_residuales === null) nullAguasResiduales++;
      });
      
      console.log('📈 Acueductos null:', nullAcueductos);
      console.log('📈 Aguas residuales null:', nullAguasResiduales);
      
      if (nullAcueductos === 0 && nullAguasResiduales === 0) {
        console.log('🎉 ¡Sin datos nulos! Corrección exitosa.');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
};

testEncuestas();
