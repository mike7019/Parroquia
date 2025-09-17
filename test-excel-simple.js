#!/usr/bin/env node

/**
 * Script simplificado para probar el endpoint de Excel
 */

import fetch from 'node-fetch';
import fs from 'fs';

async function main() {
    try {
        console.log('🚀 Probando endpoint de Excel de difuntos...');
        
        // 1. Primero probar el endpoint JSON sin autenticación para ver si está disponible
        console.log('\n📊 Probando endpoint JSON (sin autenticación)...');
        const jsonResponse = await fetch('http://localhost:3000/api/difuntos');
        console.log(`Status: ${jsonResponse.status}`);
        
        if (jsonResponse.status === 401) {
            console.log('✅ Endpoint requiere autenticación (correcto)');
        } else {
            const data = await jsonResponse.json();
            console.log('Respuesta:', data);
        }
        
        // 2. Probar endpoint de Excel sin autenticación
        console.log('\n📄 Probando endpoint Excel (sin autenticación)...');
        const excelResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        console.log(`Status: ${excelResponse.status}`);
        console.log(`Content-Type: ${excelResponse.headers.get('content-type')}`);
        
        if (excelResponse.status === 401) {
            console.log('✅ Endpoint Excel requiere autenticación (correcto)');
        } else if (excelResponse.status === 404) {
            console.log('❌ Endpoint Excel no encontrado - revisar rutas');
        } else {
            console.log('📦 Headers:', Object.fromEntries(excelResponse.headers.entries()));
        }
        
        // 3. Intentar autenticación básica
        console.log('\n🔐 Probando autenticación...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'admin123'
            })
        });
        
        console.log(`Login Status: ${loginResponse.status}`);
        
        if (loginResponse.status === 200) {
            const loginData = await loginResponse.json();
            console.log('✅ Autenticación exitosa');
            
            const token = loginData.datos?.token;
            if (token) {
                console.log('📝 Token obtenido');
                
                // 4. Probar endpoint Excel con autenticación
                console.log('\n📄 Probando endpoint Excel con autenticación...');
                const excelAuthResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({})
                });
                
                console.log(`Excel Status: ${excelAuthResponse.status}`);
                console.log(`Excel Content-Type: ${excelAuthResponse.headers.get('content-type')}`);
                
                if (excelAuthResponse.status === 200 || excelAuthResponse.status === 404) {
                    const contentType = excelAuthResponse.headers.get('content-type');
                    if (contentType && contentType.includes('spreadsheetml')) {
                        console.log('✅ Endpoint Excel funcionando - archivo generado');
                        
                        // Guardar archivo de prueba
                        const buffer = await excelAuthResponse.arrayBuffer();
                        const filename = `test_excel_${Date.now()}.xlsx`;
                        fs.writeFileSync(filename, Buffer.from(buffer));
                        console.log(`📁 Archivo guardado: ${filename}`);
                        console.log(`📏 Tamaño: ${buffer.byteLength} bytes`);
                    } else {
                        console.log('❌ Respuesta no es un archivo Excel');
                        const text = await excelAuthResponse.text();
                        console.log('Respuesta:', text.substring(0, 200) + '...');
                    }
                } else {
                    console.log('❌ Error en endpoint Excel');
                    const errorText = await excelAuthResponse.text();
                    console.log('Error:', errorText);
                }
            }
        } else {
            console.log('❌ Error en autenticación');
            const errorData = await loginResponse.text();
            console.log('Error:', errorData);
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

main();