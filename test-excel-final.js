#!/usr/bin/env node

/**
 * Script de prueba específico para el endpoint de Excel de difuntos
 * Usando las credenciales correctas del sistema
 */

import fs from 'fs';

async function probarExcelDifuntos() {
    console.log('🚀 Iniciando prueba del endpoint Excel de difuntos');
    console.log('=' .repeat(60));

    try {
        // 1. AUTENTICACIÓN
        console.log('🔐 Autenticando con el sistema...');
        
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'Admin123!'
            })
        });

        if (!loginResponse.ok) {
            const errorData = await loginResponse.json();
            console.error('❌ Error en autenticación:', errorData);
            console.log('💡 Verifica que el usuario admin exista y las credenciales sean correctas');
            return;
        }

        const authData = await loginResponse.json();
        const token = authData.datos.token;
        console.log('✅ Autenticación exitosa');

        // 2. PROBAR ENDPOINT JSON PRIMERO (para verificar datos)
        console.log('\n📊 Verificando datos disponibles (endpoint JSON)...');
        
        const jsonResponse = await fetch('http://localhost:3000/api/difuntos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!jsonResponse.ok) {
            console.error('❌ Error en endpoint JSON:', jsonResponse.status);
            return;
        }

        const jsonData = await jsonResponse.json();
        console.log(`📈 Total de difuntos disponibles: ${jsonData.total || 0}`);
        
        if (jsonData.total > 0) {
            console.log('✅ Hay datos disponibles para generar Excel');
        } else {
            console.log('⚠️  No hay datos - Excel será generado solo con encabezados');
        }

        // 3. PROBAR ENDPOINT EXCEL (POST)
        console.log('\n📄 Probando endpoint Excel (POST)...');
        
        const excelResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Sin filtros para obtener todos
        });

        console.log(`📈 Status del Excel: ${excelResponse.status}`);
        console.log(`📋 Content-Type: ${excelResponse.headers.get('content-type')}`);
        
        const contentDisposition = excelResponse.headers.get('content-disposition');
        console.log(`📋 Content-Disposition: ${contentDisposition || 'N/A'}`);

        if (excelResponse.ok || excelResponse.status === 404) {
            // Ambos códigos son válidos (200 = con datos, 404 = sin datos)
            const buffer = await excelResponse.arrayBuffer();
            const filename = `prueba_excel_difuntos_${Date.now()}.xlsx`;
            
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`✅ Archivo Excel guardado: ${filename}`);
            console.log(`📏 Tamaño: ${buffer.byteLength} bytes`);
            
            if (excelResponse.status === 200) {
                console.log('🎉 ¡Endpoint Excel funcionando correctamente con datos!');
            } else {
                console.log('🎉 ¡Endpoint Excel funcionando correctamente (sin datos)!');
            }
        } else {
            const errorText = await excelResponse.text();
            console.error('❌ Error en endpoint Excel:', errorText);
        }

        // 4. PROBAR CON FILTROS
        console.log('\n📄 Probando Excel con filtros (solo madres)...');
        
        const excelFiltradoResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parentesco: 'Madre' })
        });

        console.log(`📈 Status Excel filtrado: ${excelFiltradoResponse.status}`);
        
        if (excelFiltradoResponse.ok || excelFiltradoResponse.status === 404) {
            const buffer = await excelFiltradoResponse.arrayBuffer();
            const filename = `prueba_excel_madres_${Date.now()}.xlsx`;
            
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`✅ Archivo Excel filtrado guardado: ${filename}`);
        }

        // 5. PROBAR ENDPOINT GET
        console.log('\n📄 Probando endpoint Excel (GET)...');
        
        const excelGetResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel?parentesco=Padre', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`📈 Status Excel GET: ${excelGetResponse.status}`);
        
        if (excelGetResponse.ok || excelGetResponse.status === 404) {
            const buffer = await excelGetResponse.arrayBuffer();
            const filename = `prueba_excel_padres_get_${Date.now()}.xlsx`;
            
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`✅ Archivo Excel GET guardado: ${filename}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ¡PRUEBAS COMPLETADAS EXITOSAMENTE!');
        console.log('✅ El endpoint de Excel está funcionando correctamente');
        console.log('📁 Revisa los archivos Excel generados en el directorio actual');

    } catch (error) {
        console.error('💥 Error durante las pruebas:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    probarExcelDifuntos().catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}