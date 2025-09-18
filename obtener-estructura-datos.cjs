/**
 * Obtener estructura exacta de datos existentes
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3000/api';

// Credenciales
const AUTH_CREDENTIALS = {
    correo_electronico: "admin@parroquia.com",
    contrasena: "Admin123!"
};

async function obtenerEstructuraExistente() {
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

        console.log('\n📊 OBTENIENDO DATOS EXISTENTES:');
        
        // Obtener encuesta existente
        const response = await axios.get(`${API_BASE}/encuesta/1`, { headers });
        
        console.log('✅ Datos obtenidos');
        
        // Extraer estructura de IDs
        const data = response.data.data;
        
        console.log('\n🔍 ESTRUCTURA DE IDs ENCONTRADA:');
        
        if (data.miembros_familia && data.miembros_familia.personas.length > 0) {
            const persona = data.miembros_familia.personas[0];
            console.log('\n👤 ESTRUCTURA PERSONA VIVA:');
            console.log(`- Sexo ID: ${persona.sexo?.id} (${persona.sexo?.descripcion})`);
            console.log(`- Tipo ID: ${persona.identificacion?.tipo?.id} (${persona.identificacion?.tipo?.nombre})`);
            console.log(`- Estudios ID: ${persona.estudios?.id} (${persona.estudios?.nombre})`);
        }
        
        if (data.deceasedMembers && data.deceasedMembers.length > 0) {
            const difunto = data.deceasedMembers[0];
            console.log('\n⚰️ ESTRUCTURA PERSONA FALLECIDA:');
            console.log(`- Sexo ID: ${difunto.sexo?.id} (${difunto.sexo?.nombre})`);
            console.log(`- Parentesco ID: ${difunto.parentesco?.id} (${difunto.parentesco?.nombre})`);
        }

        console.log('\n🏠 ESTRUCTURA FAMILIA:');
        console.log(`- Tipo vivienda ID: ${data.tipo_vivienda?.id} (${data.tipo_vivienda?.nombre})`);
        console.log(`- Municipio ID: ${data.municipio?.id} (${data.municipio?.nombre})`);
        console.log(`- Sector ID: ${data.sector?.id} (${data.sector?.nombre})`);
        console.log(`- Vereda ID: ${data.vereda?.id} (${data.vereda?.nombre})`);
        console.log(`- Parroquia ID: ${data.parroquia?.id} (${data.parroquia?.nombre})`);
        console.log(`- Acueducto ID: ${data.acueducto?.id} (${data.acueducto?.nombre})`);
        console.log(`- Aguas residuales ID: ${data.aguas_residuales?.id} (${data.aguas_residuales?.nombre})`);
        
        // Guardar estructura completa para análisis
        fs.writeFileSync('estructura-datos-reales.json', JSON.stringify(data, null, 2));
        console.log('\n📄 Estructura completa guardada en: estructura-datos-reales.json');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

obtenerEstructuraExistente();