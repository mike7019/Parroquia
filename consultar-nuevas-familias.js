/**
 * Consultar los datos completos de las nuevas familias creadas
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function consultarNuevasFamilias() {
    try {
        console.log('🔐 Obteniendo token...');
        
        // Autenticación
        const authResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'Admin123!'
            })
        });
        
        const authData = await authResponse.json();
        const token = authData.data.accessToken;
        
        console.log('✅ Token obtenido');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n📊 CONSULTANDO DATOS COMPLETOS DE NUEVAS FAMILIAS:');
        
        // Consultar todas las encuestas
        const listResponse = await fetch(`${API_BASE}/encuesta?page=1&limit=10`, { headers });
        const listData = await listResponse.json();
        
        console.log(`\n✅ Total de familias: ${listData.pagination.totalItems}`);
        
        // Consultar familias Test (las nuevas)
        const familiasTest = listData.data.filter(f => f.apellido_familiar.includes('Familia Test'));
        
        for (const familia of familiasTest) {
            console.log(`\n🔍 CONSULTANDO FAMILIA: ${familia.apellido_familiar}`);
            
            const detailResponse = await fetch(`${API_BASE}/encuesta/${familia.id_encuesta}`, { headers });
            const detailData = await detailResponse.json();
            
            if (detailResponse.ok) {
                const data = detailData.data;
                
                console.log(`📋 ID: ${data.id_encuesta}`);
                console.log(`👨‍👩‍👧‍👦 Apellido: ${data.apellido_familiar}`);
                console.log(`📍 Dirección: ${data.direccion_familia}`);
                console.log(`📞 Teléfono: ${data.telefono}`);
                console.log(`🏠 Código: ${data.codigo_familia}`);
                console.log(`👥 Tamaño familia: ${data.tamaño_familia} miembros`);
                
                console.log(`\n👥 MIEMBROS VIVOS (${data.miembros_familia.total_miembros}):`);
                data.miembros_familia.personas.forEach((persona, index) => {
                    console.log(`   ${index + 1}. ${persona.nombre_completo}`);
                    console.log(`      🆔 ${persona.identificacion.numero} (${persona.identificacion.tipo.nombre})`);
                    console.log(`      📅 ${persona.fecha_nacimiento} (${persona.edad} años)`);
                    console.log(`      🚻 ${persona.sexo.descripcion}`);
                    console.log(`      🎓 ${persona.estudios.nombre}`);
                    console.log(`      📞 ${persona.telefono || 'Sin teléfono'}`);
                    console.log(`      👔 Tallas: ${persona.tallas.camisa}/${persona.tallas.pantalon}/${persona.tallas.zapato}`);
                    console.log('');
                });
                
                if (data.deceasedMembers && data.deceasedMembers.length > 0) {
                    console.log(`⚰️ MIEMBROS FALLECIDOS (${data.deceasedMembers.length}):`);
                    data.deceasedMembers.forEach((difunto, index) => {
                        console.log(`   ${index + 1}. ${difunto.nombres}`);
                        console.log(`      🚻 ${difunto.sexo.nombre}`);
                        console.log(`      👨‍👩‍👧‍👦 ${difunto.parentesco.nombre}`);
                        console.log(`      ⚰️ ${difunto.fechaFallecimiento}`);
                        console.log(`      💔 ${difunto.causaFallecimiento}`);
                        console.log('');
                    });
                }
                
                console.log(`🏠 INFORMACIÓN DE VIVIENDA:`);
                console.log(`   Tipo: ${data.tipo_vivienda.nombre}`);
                console.log(`   Municipio: ${data.municipio.nombre}`);
                console.log(`   Sector: ${data.sector.nombre}`);
                console.log(`   Vereda: ${data.vereda.nombre}`);
                console.log(`   Parroquia: ${data.parroquia.nombre}`);
                console.log(`   Acueducto: ${data.acueducto.nombre}`);
                console.log(`   Aguas residuales: ${data.aguas_residuales.nombre}`);
                
                if (data.basuras && data.basuras.length > 0) {
                    console.log(`   Disposición basuras: ${data.basuras.map(b => b.nombre).join(', ')}`);
                }
                
                console.log(`\n📊 METADATA:`);
                console.log(`   Estado: ${data.estado_encuesta}`);
                console.log(`   Fecha creación: ${data.metadatos.fecha_creacion}`);
                console.log(`   Número encuestas: ${data.numero_encuestas}`);
                
            } else {
                console.log(`❌ Error consultando familia ${familia.apellido_familiar}`);
            }
            
            console.log('\n' + '='.repeat(80));
        }
        
        console.log('\n🎊 CONSULTA COMPLETADA - TODAS LAS FAMILIAS DE PRUEBA VERIFICADAS');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

consultarNuevasFamilias();