import axios from 'axios';

async function testAPI() {
  try {
    console.log('🧪 Probando API después de las correcciones...\n');
    
    const response = await axios.get('http://localhost:3000/api/encuestas', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTcwMjQzMDAsImV4cCI6MTc1NzAyNzkwMH0.QH6VQPpgfLXMGPx8N2_s8YcyLYRZojnKlKtJ4UH8Tws'
      }
    });
    
    console.log('✅ Respuesta de la API:', response.status);
    console.log('📊 Total de encuestas:', response.data.data.length);
    
    // Verificar específicamente las familias que tenían problemas
    const familiaProblematica13 = response.data.data.find(f => f.id_encuesta === '13');
    const familiaProblematica14 = response.data.data.find(f => f.id_encuesta === '14');
    const familiaProblematica15 = response.data.data.find(f => f.id_encuesta === '15');
    
    console.log('\n🔍 Verificando familia ID 13:');
    if (familiaProblematica13) {
      console.log('  Acueducto:', familiaProblematica13.acueducto);
      console.log('  Aguas residuales:', familiaProblematica13.aguas_residuales);
      console.log('  Tipo vivienda:', familiaProblematica13.tipo_vivienda);
    }
    
    console.log('\n🔍 Verificando familia ID 14:');
    if (familiaProblematica14) {
      console.log('  Acueducto:', familiaProblematica14.acueducto);
      console.log('  Aguas residuales:', familiaProblematica14.aguas_residuales);
      console.log('  Tipo vivienda:', familiaProblematica14.tipo_vivienda);
    }
    
    console.log('\n🔍 Verificando familia ID 15:');
    if (familiaProblematica15) {
      console.log('  Acueducto:', familiaProblematica15.acueducto);
      console.log('  Aguas residuales:', familiaProblematica15.aguas_residuales);
      console.log('  Tipo vivienda:', familiaProblematica15.tipo_vivienda);
    }
    
    // Contar valores null
    let nullAcueductos = 0;
    let nullAguasResiduales = 0;
    let nullTiposVivienda = 0;
    
    response.data.data.forEach(familia => {
      if (familia.acueducto === null) nullAcueductos++;
      if (familia.aguas_residuales === null) nullAguasResiduales++;
      if (familia.tipo_vivienda === null || familia.tipo_vivienda.id === null) nullTiposVivienda++;
    });
    
    console.log('\n📈 Resumen de datos nulos:');
    console.log(`  Acueductos null: ${nullAcueductos}`);
    console.log(`  Aguas residuales null: ${nullAguasResiduales}`);
    console.log(`  Tipos de vivienda con ID null: ${nullTiposVivienda}`);
    
    if (nullAcueductos === 0 && nullAguasResiduales === 0 && nullTiposVivienda === 0) {
      console.log('\n🎉 ¡Todas las correcciones fueron exitosas! No hay más datos nulos.');
    } else {
      console.log('\n⚠️ Aún hay algunos datos nulos que requieren atención.');
    }
    
  } catch (error) {
    console.error('❌ Error probando API:', error.response?.data || error.message);
  }
}

testAPI();
