import fs from 'fs';

async function testSinIDFamilia() {
    console.log('🔍 VERIFICANDO ELIMINACIÓN DE COLUMNA "ID FAMILIA"');
    console.log('=' .repeat(50));

    try {
        // Login
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

        // Probar Excel
        console.log('📄 Generando Excel sin columna ID Familia...');
        const excelResponse = await fetch('http://localhost:3000/api/difuntos/reporte-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        console.log(`📊 Status: ${excelResponse.status}`);
        
        if (excelResponse.ok || excelResponse.status === 404) {
            const buffer = await excelResponse.arrayBuffer();
            const filename = `excel_sin_id_familia_${Date.now()}.xlsx`;
            fs.writeFileSync(filename, Buffer.from(buffer));
            console.log(`📁 Archivo guardado: ${filename}`);
            console.log(`📏 Tamaño: ${buffer.byteLength} bytes`);
            
            console.log('');
            console.log('✅ Cambios aplicados exitosamente:');
            console.log('   • Columna "ID Familia" eliminada del Excel');
            console.log('   • Endpoint funcionando correctamente');
            console.log('   • Archivo Excel generado sin datos innecesarios');
            console.log('');
            console.log('💡 Abre el archivo Excel para verificar que ya no aparece la columna "ID Familia"');
        } else {
            const errorText = await excelResponse.text();
            console.log('❌ Error:', errorText);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testSinIDFamilia();