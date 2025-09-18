/**
 * Consultar catálogos usando la API
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Credenciales
const AUTH_CREDENTIALS = {
    correo_electronico: "admin@parroquia.com",
    contrasena: "Admin123!"
};

async function consultarCatalogos() {
    try {
        console.log('🔐 Autenticando...');
        
        // Autenticación
        const authResponse = await axios.post(`${API_BASE}/auth/login`, AUTH_CREDENTIALS);
        const token = authResponse.data.data.accessToken;
        
        console.log('✅ Token obtenido');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n📊 CONSULTANDO CATÁLOGOS VIA API:');
        
        // Consultar diferentes catálogos
        const catalogos = [
            { nombre: 'Sexos', url: '/catalog/sexo' },
            { nombre: 'Tipos Identificación', url: '/catalog/tipo-identificacion' },
            { nombre: 'Estudios', url: '/catalog/estudios' },
            { nombre: 'Parentescos', url: '/catalog/parentesco' },
            { nombre: 'Profesiones', url: '/catalog/profesion' },
            { nombre: 'Enfermedades', url: '/catalog/enfermedad' },
            { nombre: 'Comunidades Culturales', url: '/catalog/comunidad-cultural' }
        ];

        for (const catalogo of catalogos) {
            try {
                const response = await axios.get(`${API_BASE}${catalogo.url}`, { headers });
                
                console.log(`\n🔍 ${catalogo.nombre.toUpperCase()}:`);
                
                if (response.data.datos && response.data.datos.length > 0) {
                    response.data.datos.slice(0, 5).forEach(item => {
                        const id = item.id_sexo || item.id_tipo_identificacion || item.id_estudios || 
                                  item.id_parentesco || item.id_estado_civil || item.id_profesion || 
                                  item.id_enfermedad || item.id_comunidad_cultural || item.id;
                        const nombre = item.descripcion || item.nombre;
                        console.log(`   ID: ${id}, Nombre: ${nombre}`);
                    });
                    
                    if (response.data.datos.length > 5) {
                        console.log(`   ... y ${response.data.datos.length - 5} más`);
                    }
                } else {
                    console.log('   No hay datos disponibles');
                }
                
            } catch (error) {
                console.log(`   ❌ Error consultando ${catalogo.nombre}: ${error.response?.status || error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

consultarCatalogos();