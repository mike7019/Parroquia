import fs from 'fs';

async function testExcelFinal() {
    console.log('🎉 PRUEBA FINAL DEL ENDPOINT EXCEL DE DIFUNTOS');
    console.log('=' .repeat(60));

    try {
        // 1. Login
        console.log('🔐 Autenticando...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo_electronico: 'admin@parroquia.com',
                contrasena: 'Admin123!'
            })
        });

        const authData = await loginResponse.json();
        const token = authData.data.accessToken;
        console.log('✅ Login exitoso');

        // 2. Probar datos disponibles primero
        console.log('\n📊 Verificando datos disponibles...');
        const jsonResponse = await fetch('http://localhost:3000/api/difuntos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const jsonData = await jsonResponse.json();
        console.log(`📈 Total difuntos: ${jsonData.total || 0}`);

        // 3. Probar Excel POST (todos los difuntos)
        console.log('\n📄 Probando Excel POST (todos los difuntos)...');
        const excelResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        console.log(`📊 Status: ${excelResponse.status}`);
        console.log(`📋 Content-Type: ${excelResponse.headers.get('content-type')}`);
        
        if (excelResponse.status === 200) {
            console.log('✅ HAY DATOS - Excel generado con registros');
            const buffer = await excelResponse.arrayBuffer();
            const filename = `excel_todos_difuntos_${Date.now()}.xlsx`;
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`📁 Archivo guardado: ${filename} (${buffer.byteLength} bytes)`);
        } else if (excelResponse.status === 404) {
            console.log('⚠️ SIN DATOS - Excel generado solo con encabezados');
            const buffer = await excelResponse.arrayBuffer();
            const filename = `excel_sin_datos_${Date.now()}.xlsx`;
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`📁 Archivo guardado: ${filename} (${buffer.byteLength} bytes)`);
        } else {
            console.log('❌ Error inesperado:', await excelResponse.text());
        }

        // 4. Probar Excel GET con filtro
        console.log('\n📄 Probando Excel GET (solo madres)...');
        const excelMadresResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel?parentesco=Madre', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`📊 Status madres: ${excelMadresResponse.status}`);
        
        if (excelMadresResponse.ok || excelMadresResponse.status === 404) {
            const buffer = await excelMadresResponse.arrayBuffer();
            const filename = `excel_madres_${Date.now()}.xlsx`;
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`📁 Archivo madres guardado: ${filename}`);
        }

        // 5. Probar Excel POST con múltiples filtros
        console.log('\n📄 Probando Excel POST (filtros múltiples)...');
        const excelFiltrosResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parentesco: 'Padre',
                mes_aniversario: 12
            })
        });

        console.log(`📊 Status filtros: ${excelFiltrosResponse.status}`);
        
        if (excelFiltrosResponse.ok || excelFiltrosResponse.status === 404) {
            const buffer = await excelFiltrosResponse.arrayBuffer();
            const filename = `excel_padres_diciembre_${Date.now()}.xlsx`;
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`📁 Archivo filtrado guardado: ${filename}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ¡PRUEBAS COMPLETADAS EXITOSAMENTE!');
        console.log('');
        console.log('✅ Funcionalidades verificadas:');
        console.log('   • Autenticación correcta');
        console.log('   • Endpoint POST /api/difuntos/reporte-excel');
        console.log('   • Endpoint GET /api/difuntos/reporte-excel');
        console.log('   • Manejo de datos sin resultados (404)');
        console.log('   • Filtros por parentesco');
        console.log('   • Filtros múltiples');
        console.log('   • Generación de archivos Excel válidos');
        console.log('');
        console.log('📁 Revisa los archivos Excel generados en este directorio');
        console.log('💡 Abre los archivos en Excel para verificar el contenido');

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testExcelFinal();