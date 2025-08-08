import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testBasicParroquiaAPI() {
  try {
    console.log('🚀 Iniciando pruebas básicas del API de Parroquias...\n');
    
    // 1. Test de salud del sistema
    console.log('1. 🏥 Probando endpoint de salud...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ API de salud:', healthResponse.data.status || 'OK');
    } catch (error) {
      console.log('❌ Error en endpoint de salud:', error.message);
    }
    
    // 2. Test de documentación Swagger
    console.log('\n2. 📚 Probando documentación Swagger...');
    try {
      const swaggerResponse = await axios.get(`${BASE_URL}-docs`, {
        headers: { 'Accept': 'text/html' }
      });
      console.log('✅ Swagger documentación disponible');
    } catch (error) {
      console.log('❌ Error en Swagger:', error.message);
    }
    
    // 3. Test de endpoints públicos
    console.log('\n3. 🔓 Probando endpoints públicos...');
    try {
      const catalogHealthResponse = await axios.get(`${BASE_URL}/catalog/health`);
      console.log('✅ Catalog health:', catalogHealthResponse.data.status || 'OK');
    } catch (error) {
      console.log('❌ Error en catalog health:', error.message);
    }
    
    // 4. Test de endpoint protegido sin autenticación (debe fallar)
    console.log('\n4. 🔒 Probando endpoint protegido sin autenticación...');
    try {
      const parroquiasResponse = await axios.get(`${BASE_URL}/catalog/parroquias`);
      console.log('⚠️ Endpoint protegido respondió sin autenticación (inesperado)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint protegido correctamente (401 Unauthorized)');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }
    
    // 5. Intentar crear un usuario administrador para pruebas futuras
    console.log('\n5. 👤 Intentando registrar usuario administrador...');
    try {
      const adminUser = {
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'admin123',
        confirmar_contrasena: 'admin123'
      };
      
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, adminUser);
      console.log('✅ Usuario administrador registrado exitosamente');
      console.log('📧 Email:', adminUser.correo_electronico);
      console.log('🔑 Contraseña:', adminUser.contrasena);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️ Usuario administrador ya existe');
      } else {
        console.log('❌ Error registrando usuario:', error.response?.data?.message || error.message);
      }
    }
    
    // 6. Test de login
    console.log('\n6. 🔐 Probando login con credenciales...');
    try {
      const loginData = {
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'admin123'
      };
      
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      console.log('✅ Login exitoso');
      const token = loginResponse.data.token;
      console.log('🎫 Token obtenido');
      
      // 7. Test de endpoint protegido con autenticación
      console.log('\n7. 🔓 Probando endpoint protegido con autenticación...');
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const parroquiasResponse = await axios.get(`${BASE_URL}/catalog/parroquias`, { headers: authHeaders });
      console.log('✅ Acceso a parroquias exitoso');
      console.log(`📊 Datos obtenidos:`, typeof parroquiasResponse.data);
      
      // 8. Test de municipios para crear parroquia
      console.log('\n8. 🏙️ Obteniendo municipios disponibles...');
      const municipiosResponse = await axios.get(`${BASE_URL}/catalog/municipios`, { headers: authHeaders });
      const municipios = municipiosResponse.data.data || municipiosResponse.data;
      
      if (Array.isArray(municipios) && municipios.length > 0) {
        const municipio = municipios[0];
        console.log(`✅ Municipio disponible: ${municipio.nombre_municipio} (ID: ${municipio.id_municipio})`);
        
        // 9. Test de creación de parroquia
        console.log('\n9. ➕ Creando nueva parroquia...');
        const nuevaParroquia = {
          nombre: 'Parroquia San José Test',
          id_municipio: municipio.id_municipio,
          descripcion: 'Parroquia de prueba creada por el test automatizado',
          direccion: 'Calle Test #123-456',
          telefono: '+57 300 123 4567',
          email: 'test@parroquia.com',
          activo: true
        };
        
        const createResponse = await axios.post(`${BASE_URL}/catalog/parroquias`, nuevaParroquia, { headers: authHeaders });
        const parroquiaCreada = createResponse.data.data;
        
        console.log('✅ Parroquia creada exitosamente:');
        console.log(`   📍 ID: ${parroquiaCreada.id_parroquia}`);
        console.log(`   📝 Nombre: ${parroquiaCreada.nombre}`);
        console.log(`   🏙️ Municipio: ${parroquiaCreada.municipio?.nombre_municipio || 'N/A'}`);
        console.log(`   📧 Email: ${parroquiaCreada.email}`);
        
      } else {
        console.log('⚠️ No hay municipios disponibles para crear parroquia');
      }
      
    } catch (error) {
      console.log('❌ Error en login o pruebas autenticadas:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Pruebas básicas completadas');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

testBasicParroquiaAPI();
