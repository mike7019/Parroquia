#!/usr/bin/env node

/**
 * Script para probar el endpoint de Excel de difuntos
 * Prueba tanto con datos como sin datos para validar todos los escenarios
 */

import fs from 'fs';
import path from 'path';

// Función para hacer request HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        return {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: response.headers.get('content-type')?.includes('application/json') 
                ? await response.json() 
                : await response.arrayBuffer()
        };
    } catch (error) {
        console.error('❌ Error en request:', error.message);
        return null;
    }
}

// Función para autenticarse y obtener token
async function obtenerToken() {
    console.log('🔐 Autenticando...');
    
    const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        })
    });

    if (!loginResponse || loginResponse.status !== 200) {
        console.error('❌ Error en autenticación:', loginResponse?.data);
        console.log('💡 Sugerencias:');
        console.log('   - Verifica que el servidor esté corriendo en http://localhost:3000');
        console.log('   - Revisa las credenciales del usuario admin');
        console.log('   - Ejecuta: npm run admin:create si no existe usuario admin');
        return null;
    }

    console.log('✅ Autenticación exitosa');
    return loginResponse.data.datos.token;
}

// Función para probar endpoint JSON (verificar datos disponibles)
async function probarEndpointJSON(token, filtros = {}) {
    console.log('\n📊 Probando endpoint JSON para verificar datos...');
    
    const url = new URL('http://localhost:3000/api/difuntos');
    Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
            url.searchParams.append(key, filtros[key]);
        }
    });

    const response = await makeRequest(url.toString(), {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response) return null;

    console.log(`📈 Status: ${response.status}`);
    console.log(`📦 Total registros: ${response.data?.total || 0}`);
    
    return response;
}

// Función para probar endpoint Excel POST
async function probarExcelPOST(token, filtros = {}, nombreArchivo = 'test') {
    console.log(`\n📄 Probando Excel POST (${nombreArchivo})...`);
    
    const response = await makeRequest('http://localhost:3000/api/difuntos/reporte-excel', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filtros)
    });

    if (!response) return false;

    console.log(`📈 Status: ${response.status}`);
    console.log(`📋 Headers importantes:`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Disposition: ${response.headers['content-disposition']}`);
    console.log(`   X-Total-Records: ${response.headers['x-total-records'] || 'N/A'}`);
    console.log(`   X-No-Data: ${response.headers['x-no-data'] || 'N/A'}`);

    // Guardar archivo si es Excel
    if (response.headers['content-type']?.includes('spreadsheetml')) {
        const filename = `excel_${nombreArchivo}_${Date.now()}.xlsx`;
        const filepath = path.join(process.cwd(), filename);
        
        try {
            fs.writeFileSync(filepath, Buffer.from(response.data));
            console.log(`✅ Archivo guardado: ${filename}`);
            console.log(`📏 Tamaño: ${Buffer.from(response.data).length} bytes`);
        } catch (error) {
            console.error(`❌ Error guardando archivo: ${error.message}`);
        }
    }

    return response.status === 200 || response.status === 404;
}

// Función para probar endpoint Excel GET
async function probarExcelGET(token, filtros = {}, nombreArchivo = 'test_get') {
    console.log(`\n📄 Probando Excel GET (${nombreArchivo})...`);
    
    const url = new URL('http://localhost:3000/api/difuntos/reporte-excel');
    Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
            url.searchParams.append(key, filtros[key]);
        }
    });

    const response = await makeRequest(url.toString(), {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response) return false;

    console.log(`📈 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);

    // Guardar archivo si es Excel
    if (response.headers['content-type']?.includes('spreadsheetml')) {
        const filename = `excel_${nombreArchivo}_${Date.now()}.xlsx`;
        const filepath = path.join(process.cwd(), filename);
        
        try {
            fs.writeFileSync(filepath, Buffer.from(response.data));
            console.log(`✅ Archivo guardado: ${filename}`);
        } catch (error) {
            console.error(`❌ Error guardando archivo: ${error.message}`);
        }
    }

    return response.status === 200 || response.status === 404;
}

// Función principal
async function main() {
    console.log('🚀 Iniciando pruebas del endpoint Excel de difuntos');
    console.log('=' .repeat(60));

    // 1. Obtener token
    const token = await obtenerToken();
    if (!token) {
        console.error('❌ No se pudo obtener token. Revisa las credenciales.');
        process.exit(1);
    }

    // 2. Verificar datos disponibles
    const jsonResponse = await probarEndpointJSON(token);
    if (!jsonResponse) {
        console.error('❌ No se pudo consultar el endpoint JSON');
        process.exit(1);
    }

    const hayDatos = jsonResponse.data?.total > 0;
    console.log(`\n📊 Estado de datos: ${hayDatos ? '✅ HAY DATOS' : '⚠️  SIN DATOS'}`);

    // 3. Pruebas de Excel con diferentes escenarios
    const resultados = [];

    // Prueba 1: Todos los difuntos (POST)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 1: Todos los difuntos (POST)');
    const r1 = await probarExcelPOST(token, {}, 'todos_post');
    resultados.push({ prueba: 'Todos POST', exito: r1 });

    // Prueba 2: Todos los difuntos (GET)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 2: Todos los difuntos (GET)');
    const r2 = await probarExcelGET(token, {}, 'todos_get');
    resultados.push({ prueba: 'Todos GET', exito: r2 });

    // Prueba 3: Solo madres (POST)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 3: Solo madres (POST)');
    const r3 = await probarExcelPOST(token, { parentesco: 'Madre' }, 'madres_post');
    resultados.push({ prueba: 'Madres POST', exito: r3 });

    // Prueba 4: Solo padres (GET)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 4: Solo padres (GET)');
    const r4 = await probarExcelGET(token, { parentesco: 'Padre' }, 'padres_get');
    resultados.push({ prueba: 'Padres GET', exito: r4 });

    // Prueba 5: Rango de fechas (POST)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 5: Rango de fechas 2020 (POST)');
    const r5 = await probarExcelPOST(token, { 
        fecha_inicio: '2020-01-01', 
        fecha_fin: '2020-12-31' 
    }, 'rango_2020_post');
    resultados.push({ prueba: 'Rango 2020 POST', exito: r5 });

    // Prueba 6: Mes específico (GET)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 6: Mes mayo (GET)');
    const r6 = await probarExcelGET(token, { mes_aniversario: 5 }, 'mayo_get');
    resultados.push({ prueba: 'Mayo GET', exito: r6 });

    // Prueba 7: Búsqueda por nombre (POST)
    console.log('\n' + '='.repeat(40));
    console.log('PRUEBA 7: Búsqueda por nombre "Maria" (POST)');
    const r7 = await probarExcelPOST(token, { nombre: 'Maria' }, 'nombre_maria_post');
    resultados.push({ prueba: 'Nombre Maria POST', exito: r7 });

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE PRUEBAS');
    console.log('='.repeat(60));

    let exitosas = 0;
    resultados.forEach(resultado => {
        const icono = resultado.exito ? '✅' : '❌';
        console.log(`${icono} ${resultado.prueba}`);
        if (resultado.exito) exitosas++;
    });

    console.log(`\n📊 Resultados: ${exitosas}/${resultados.length} pruebas exitosas`);
    
    if (exitosas === resultados.length) {
        console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
        console.log('✅ El endpoint de Excel está funcionando correctamente');
    } else {
        console.log('⚠️  Algunas pruebas fallaron. Revisar logs arriba.');
    }

    console.log('\n📁 Archivos Excel generados en el directorio actual');
    console.log('📖 Revisa los archivos para verificar el contenido');

    process.exit(0);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}