const axios = require('axios');

async function testEncuestasAPI() {
    try {
        console.log('🧪 Iniciando test final de la API de encuestas...');
        
        // Test de la API sin autenticación primero para ver la estructura
        const response = await axios.get('http://localhost:3000/api/encuestas', {
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500; // Resuelve solo si el status es menor a 500
            }
        });
        
        console.log('📊 Status de respuesta:', response.status);
        
        if (response.status === 401) {
            console.log('🔐 API requiere autenticación - esto es normal');
            console.log('📋 Mensaje:', response.data.message || response.data);
            return;
        }
        
        if (response.status === 200) {
            console.log('✅ API respondió exitosamente');
            console.log('📦 Datos recibidos:', response.data.length, 'familias');
            
            // Verificar las primeras familias para null relationships
            const familias = response.data.slice(0, 5);
            
            console.log('\n🔍 Verificando primeras 5 familias:');
            familias.forEach((familia, index) => {
                console.log(`\n--- Familia ${familia.id} ---`);
                console.log('Acueducto:', familia.acueducto);
                console.log('Aguas Residuales:', familia.aguas_residuales);
                console.log('Tipo Vivienda:', familia.tipo_vivienda);
                
                // Verificar si hay valores null correctos (no objetos con id: null)
                if (familia.acueducto && typeof familia.acueducto === 'object' && familia.acueducto.id === null) {
                    console.log('❌ PROBLEMA: acueducto tiene objeto con id: null');
                }
                if (familia.aguas_residuales && typeof familia.aguas_residuales === 'object' && familia.aguas_residuales.id === null) {
                    console.log('❌ PROBLEMA: aguas_residuales tiene objeto con id: null');
                }
                if (familia.tipo_vivienda && typeof familia.tipo_vivienda === 'object' && familia.tipo_vivienda.id === null) {
                    console.log('❌ PROBLEMA: tipo_vivienda tiene objeto con id: null');
                }
            });
            
        } else {
            console.log('⚠️ Respuesta inesperada:', response.status);
            console.log('📋 Data:', response.data);
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('🔴 Error: No se puede conectar al servidor. ¿Está ejecutándose en el puerto 3000?');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Error: Timeout - el servidor no respondió a tiempo');
        } else {
            console.log('❌ Error en el test:', error.message);
            if (error.response) {
                console.log('📊 Status:', error.response.status);
                console.log('📋 Data:', error.response.data);
            }
        }
    }
}

// Ejecutar el test
testEncuestasAPI();
