const axios = require('axios');

const testEncuestaCreation = async () => {
    try {
        console.log('🧪 Probando creación de encuesta después del sync...\n');
        
        const encuestaData = {
            "id_parroquia": 1,
            "id_municipio": 1,
            "fecha": "2024-01-15",
            "id_sector": 1,
            "id_vereda": 1,
            "observaciones": "Encuesta de prueba post-sync",
            "tratamiento_datos": true,
            "familia": {
                "numero_casa": "123",
                "tamaño_familia": 4,
                "id_municipio": 1,
                "id_vereda": 1,
                "id_sector": 1,
                "ubicacion_geografica": "12.345,-67.890",
                "observaciones": "Familia de prueba",
                "activo": true
            },
            "personas": [
                {
                    "primer_nombre": "Juan",
                    "primer_apellido": "Pérez",
                    "id_tipo_identificacion_tipo_identificacion": 1,
                    "identificacion": "12345678901",
                    "telefono": "3001234567",
                    "correo_electronico": "juan.perez@test.com",
                    "fecha_nacimiento": "1990-05-15",
                    "direccion": "Calle 123 #45-67",
                    "id_sexo": 1
                }
            ]
        };

        console.log('📋 Datos de prueba preparados');
        console.log('🔄 Enviando solicitud POST...\n');
        
        const response = await axios.post('http://localhost:3000/api/encuesta', encuestaData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ ¡Encuesta creada exitosamente!');
        console.log('📊 Respuesta del servidor:');
        console.log('   - ID Encuesta:', response.data.id_encuesta);
        console.log('   - ID Familia:', response.data.id_familia);
        console.log('   - Fecha:', response.data.fecha);
        console.log('   - Personas creadas:', response.data.personas_creadas || 'No especificado');
        console.log('\n🎉 El problema del constraint "id_familia null" ha sido resuelto!');

    } catch (error) {
        console.error('❌ Error al crear encuesta:');
        
        if (error.response) {
            console.error('   - Status:', error.response.status);
            console.error('   - Mensaje:', error.response.data.message || error.response.data);
            
            if (error.response.data.error) {
                console.error('   - Error detallado:', error.response.data.error);
            }
        } else if (error.request) {
            console.error('   - Sin respuesta del servidor. ¿Está ejecutándose en http://localhost:3000?');
        } else {
            console.error('   - Error:', error.message);
        }
        
        console.log('\n🔍 Diagnóstico:');
        if (error.response?.data?.message?.includes('id_familia')) {
            console.log('   - El problema del constraint persiste, revisar el modelo Familias');
        } else if (error.response?.status === 404) {
            console.log('   - El endpoint no existe o el servidor no está ejecutándose');
        } else {
            console.log('   - Error diferente al constraint original');
        }
    }
};

// Ejecutar la prueba
testEncuestaCreation();
