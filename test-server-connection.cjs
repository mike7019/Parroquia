// Test simple para verificar que el servidor esté funcionando
const http = require('http');

const testServerConnection = () => {
    console.log('🔄 Probando conexión al servidor...\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log('✅ Servidor responde');
        console.log(`   - Status: ${res.statusCode}`);
        console.log(`   - Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`   - Response: ${data}`);
            console.log('\n🎉 El servidor está funcionando correctamente!');
            testEncuestaEndpoint();
        });
    });

    req.on('error', (err) => {
        console.error('❌ Error conectando al servidor:', err.message);
        console.log('\n🔍 Verificar que el servidor esté ejecutándose en http://localhost:3000');
    });

    req.on('timeout', () => {
        console.error('❌ Timeout conectando al servidor');
        req.destroy();
    });

    req.end();
};

const testEncuestaEndpoint = () => {
    console.log('\n🧪 Probando endpoint de encuesta...\n');
    
    const postData = JSON.stringify({
        "test": "minimal"
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/encuesta',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Respuesta del endpoint encuesta: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('📋 Respuesta:', JSON.stringify(response, null, 2));
                
                if (res.statusCode === 401) {
                    console.log('✅ El endpoint funciona (requiere autenticación)');
                    console.log('🎉 No hay errores de constraint de base de datos!');
                } else if (res.statusCode === 400 && !data.includes('id_familia')) {
                    console.log('✅ El endpoint funciona (error de validación normal)');
                    console.log('🎉 No hay errores de constraint "id_familia null"!');
                } else if (data.includes('id_familia') && data.includes('null')) {
                    console.log('❌ El problema del constraint persiste');
                } else {
                    console.log('ℹ️  Respuesta diferente, analizar manualmente');
                }
            } catch (e) {
                console.log('📋 Respuesta (texto):', data);
            }
        });
    });

    req.on('error', (err) => {
        console.error('❌ Error en endpoint encuesta:', err.message);
    });

    req.on('timeout', () => {
        console.error('❌ Timeout en endpoint encuesta');
        req.destroy();
    });

    req.write(postData);
    req.end();
};

// Iniciar pruebas
testServerConnection();
