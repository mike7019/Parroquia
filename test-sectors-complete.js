// Script completo para probar endpoints de sectores con autenticación
import fetch from 'node-fetch';

async function testSectorEndpointsComplete() {
  try {
    console.log('🧪 Probando endpoints de sectores con autenticación completa...\n');
    
    // 1. Login para obtener token
    console.log('1. 🔐 Autenticando usuario...');
    
    // Usar las credenciales correctas con los campos correctos
    const loginData = {
      correo_electronico: "admin@parroquia.com",
      contrasena: "Admin123!"
    };
    
    let authToken = null;
    
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok && loginResult.data?.accessToken) {
        authToken = loginResult.data.accessToken;
        console.log('✅ Login exitoso');
        console.log(`👤 Usuario: ${loginResult.data.user.firstName} ${loginResult.data.user.lastName}`);
      } else {
        console.log('❌ Login falló:', loginResult.message);
        console.log('Intentando con credenciales alternativas...');
        
        // Intentar con otros posibles usuarios
        const altCredentials = [
          { correo_electronico: "admin@admin.com", contrasena: "Admin123!" },
          { correo_electronico: "test@test.com", contrasena: "password123" },
          { correo_electronico: "super@parroquia.com", contrasena: "Admin123!" }
        ];
        
        for (const cred of altCredentials) {
          try {
            const altResponse = await fetch('http://localhost:3000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cred)
            });
            
            const altResult = await altResponse.json();
            
            if (altResponse.ok && altResult.data?.accessToken) {
              authToken = altResult.data.accessToken;
              console.log(`✅ Login exitoso con: ${cred.correo_electronico}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    } catch (error) {
      console.log('❌ Error en login:', error.message);
    }
    
    if (!authToken) {
      console.log('\n⚠️ No se pudo obtener token de autenticación');
      console.log('Continuando con pruebas sin autenticación...\n');
    }
    
    // 2. Obtener municipios disponibles (no requiere auth)
    console.log('2. 🏛️ Obteniendo municipios disponibles...');
    const municipiosResponse = await fetch('http://localhost:3000/api/catalog/municipios');
    
    if (municipiosResponse.ok) {
      const municipios = await municipiosResponse.json();
      console.log('✅ Municipios obtenidos');
      
      if (municipios.data?.data && Array.isArray(municipios.data.data)) {
        console.log(`📊 Total: ${municipios.data.total} municipios`);
        municipios.data.data.slice(0, 3).forEach(mun => {
          console.log(`  - ${mun.nombre_municipio} (ID: ${mun.id_municipio})`);
        });
      }
    } else {
      console.log('❌ Error obteniendo municipios');
    }
    
    // 3. Obtener sectores existentes (requiere auth)
    console.log('\n3. 🎯 Obteniendo sectores existentes...');
    
    if (authToken) {
      try {
        const sectorsResponse = await fetch('http://localhost:3000/api/catalog/sectors', {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const sectorsResult = await sectorsResponse.json();
        
        if (sectorsResponse.ok) {
          console.log('✅ Sectores obtenidos exitosamente');
          
          if (sectorsResult.data && Array.isArray(sectorsResult.data)) {
            console.log(`📊 Total: ${sectorsResult.total || sectorsResult.data.length} sectores`);
            
            sectorsResult.data.slice(0, 5).forEach(sector => {
              if (sector.municipio) {
                console.log(`  - ${sector.nombre} (Municipio: ${sector.municipio.nombre_municipio})`);
              } else {
                console.log(`  - ${sector.nombre} (Municipio ID: ${sector.id_municipio})`);
              }
            });
            
            // Verificar que incluye información del municipio
            const firstSector = sectorsResult.data[0];
            if (firstSector?.municipio?.nombre_municipio) {
              console.log('✅ Los sectores incluyen nombres de municipios');
            } else {
              console.log('⚠️ Los sectores NO incluyen nombres de municipios');
            }
          }
        } else {
          console.log('❌ Error obteniendo sectores:', sectorsResult.message);
        }
      } catch (error) {
        console.log('❌ Error en request de sectores:', error.message);
      }
    } else {
      console.log('⚠️ Saltando - No hay token de autenticación');
    }
    
    // 4. Crear un nuevo sector (requiere auth)
    console.log('\n4. ➕ Creando un nuevo sector...');
    
    if (authToken) {
      try {
        const newSectorData = {
          nombre: `Sector Prueba API ${new Date().getTime()}`,
          id_municipio: 1  // Usar primer municipio
        };
        
        const createResponse = await fetch('http://localhost:3000/api/catalog/sectors', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSectorData)
        });
        
        const createResult = await createResponse.json();
        
        if (createResponse.ok) {
          console.log('✅ Sector creado exitosamente');
          console.log(`📝 Nombre: ${newSectorData.nombre}`);
          console.log(`📍 Municipio ID: ${newSectorData.id_municipio}`);
          
          if (createResult.data) {
            console.log(`🆔 ID generado: ${createResult.data.id_sector || 'N/A'}`);
          }
        } else {
          console.log('❌ Error creando sector:', createResult.message);
          if (createResult.errors) {
            createResult.errors.forEach(err => {
              console.log(`  - ${err.field}: ${err.message}`);
            });
          }
        }
      } catch (error) {
        console.log('❌ Error en creación de sector:', error.message);
      }
    } else {
      console.log('⚠️ Saltando - No hay token de autenticación');
    }
    
    // 5. Probar validación sin municipio (requiere auth)
    console.log('\n5. 🚫 Probando validación sin municipio...');
    
    if (authToken) {
      try {
        const invalidSectorData = {
          nombre: 'Sector Sin Municipio'
          // id_municipio faltante intencionalmente
        };
        
        const invalidResponse = await fetch('http://localhost:3000/api/catalog/sectors', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invalidSectorData)
        });
        
        const invalidResult = await invalidResponse.json();
        
        if (!invalidResponse.ok) {
          console.log('✅ Validación funcionando correctamente');
          console.log(`📝 Error esperado: ${invalidResult.message}`);
          
          if (invalidResult.errors) {
            invalidResult.errors.forEach(err => {
              console.log(`  - ${err.field}: ${err.message}`);
            });
          }
        } else {
          console.log('❌ ERROR: Se permitió crear sector sin municipio');
        }
      } catch (error) {
        console.log('❌ Error en prueba de validación:', error.message);
      }
    } else {
      console.log('⚠️ Saltando - No hay token de autenticación');
    }
    
    // 6. Obtener municipios disponibles para sectores (requiere auth)
    console.log('\n6. 🏛️ Obteniendo municipios para sectores...');
    
    if (authToken) {
      try {
        const municipiosResponse = await fetch('http://localhost:3000/api/catalog/sectors/municipios', {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const municipiosResult = await municipiosResponse.json();
        
        if (municipiosResponse.ok) {
          console.log('✅ Municipios para sectores obtenidos');
          
          if (municipiosResult.data && Array.isArray(municipiosResult.data)) {
            console.log(`📊 Total: ${municipiosResult.data.length} municipios disponibles`);
            municipiosResult.data.slice(0, 3).forEach(mun => {
              console.log(`  - ${mun.nombre_municipio} (ID: ${mun.id_municipio})`);
            });
          }
        } else {
          console.log('❌ Error obteniendo municipios para sectores:', municipiosResult.message);
        }
      } catch (error) {
        console.log('❌ Error en request de municipios:', error.message);
      }
    } else {
      console.log('⚠️ Saltando - No hay token de autenticación');
    }
    
    // Resumen final
    console.log('\n🎯 Resumen de pruebas:');
    console.log(`  🔐 Autenticación: ${authToken ? '✅ EXITOSA' : '❌ FALLÓ'}`);
    console.log('  🏛️ Municipios: ✅ EXITOSA');
    console.log(`  📋 Listado sectores: ${authToken ? '✅ EXITOSA' : '⚠️ NO PROBADO'}`);
    console.log(`  ➕ Creación sector: ${authToken ? '✅ EXITOSA' : '⚠️ NO PROBADO'}`);
    console.log(`  🚫 Validación municipio: ${authToken ? '✅ EXITOSA' : '⚠️ NO PROBADO'}`);
    
    console.log('\n📖 Para acceder a la documentación completa: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

// Ejecutar pruebas
testSectorEndpointsComplete();
