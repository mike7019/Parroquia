import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000';

async function testReporteGeografia() {
  try {
    console.log('🧪 Probando generación de reporte Excel con geografía...\n');

    // Hacer login para obtener token
    console.log('🔐 Iniciando sesión...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login exitoso\n');

    // Generar reporte sin filtros para incluir todas las personas
    console.log('📊 Generando reporte de personas...');
    const response = await axios.get(`${API_URL}/api/personas/consolidado/reporte`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });

    // Guardar el archivo Excel
    const outputPath = path.join(process.cwd(), 'test-reporte-geografia.xlsx');
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`✅ Reporte generado exitosamente`);
    console.log(`📁 Archivo guardado en: ${outputPath}`);
    console.log(`📦 Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log('\n📋 Abre el archivo Excel y verifica las columnas:');
    console.log('   - Corregimiento');
    console.log('   - Centro Poblado');
    console.log('\n💡 Las columnas deben estar después de "Vereda" y antes de "Parroquia"');

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || 'Sin mensaje');
    } else {
      console.error(error.message);
    }
  }
}

testReporteGeografia();
