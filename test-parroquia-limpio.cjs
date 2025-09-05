// Prueba específica para el problema de parroquia que devuelve null
const API_BASE = 'http://localhost:3000/api';

// Función principal
async function ejecutarPruebaParroquia() {
  console.log('🚀 INICIANDO PRUEBA ESPECÍFICA DE PARROQUIA');
  console.log('=' * 60);
  
  try {
    // Importar fetch dinámicamente
    const { default: fetch } = await import('node-fetch');
    
    // Función de login 
    async function login() {
      console.log('🔐 Obteniendo token de autenticación...');
      
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
          })
        });

        const data = await response.json();
        
        // Extraer token correctamente
        const token = data.data?.accessToken || data.accessToken || data.token;
        
        if (response.ok && token) {
          console.log('✅ Token obtenido exitosamente');
          return token;
        } else {
          console.log('❌ Error al obtener token:', data.message || 'Error desconocido');
          return null;
        }
      } catch (error) {
        console.error('❌ Error en login:', error.message);
        return null;
      }
    }

    // Función para probar el problema específico de parroquia
    async function probarProblemaParroquia(token) {
      console.log('\n🔍 PROBANDO PROBLEMA ESPECÍFICO DE PARROQUIA');
      console.log('=' * 50);
      
      try {
        // 1. Consultar encuestas existentes
        console.log('\n1. 📋 Consultando encuestas existentes...');
        const response = await fetch(`${API_BASE}/encuesta?page=1&limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ Consulta exitosa - ${data.data?.length || 0} encuestas encontradas`);
          
          if (data.data && data.data.length > 0) {
            console.log('\n🔍 Verificando información de parroquia en encuestas existentes:');
            
            data.data.forEach((encuesta, index) => {
              console.log(`\nEncuesta ${index + 1} (ID: ${encuesta.id_encuesta}):`);
              console.log(`  - Familia: ${encuesta.apellido_familiar}`);
              console.log(`  - Parroquia:`, JSON.stringify(encuesta.parroquia, null, 4));
              
              if (!encuesta.parroquia) {
                console.log('❌ PROBLEMA: parroquia es null/undefined');
              } else if (!encuesta.parroquia.id || !encuesta.parroquia.nombre) {
                console.log('⚠️  PROBLEMA PARCIAL: parroquia existe pero falta id o nombre');
                console.log(`    - ID: ${encuesta.parroquia.id}`);
                console.log(`    - Nombre: ${encuesta.parroquia.nombre}`);
              } else {
                console.log('✅ CORRECTO: parroquia tiene id y nombre');
              }
            });
          }
          
          // 2. Crear una encuesta con parroquia especificada
          console.log('\n2. 🆕 Creando nueva encuesta con parroquia específica...');
          
          const nuevaEncuesta = {
            informacionGeneral: {
              fecha: "2025-09-05",
              apellido_familiar: "PRUEBA_PARROQUIA_" + Date.now(),
              direccion: "Calle Prueba Parroquia 123",
              telefono: "3001234567",
              numero_contrato_epm: "EPM-PARROQUIA-001",
              comunionEnCasa: true,
              municipio: {
                id: "3",
                nombre: "BOGOTÁ"
              },
              parroquia: {
                id: "4", 
                nombre: "La Inmaculada"
              },
              sector: {
                id: "1",
                nombre: "Centro"
              },
              vereda: {
                id: "1",
                nombre: "Urbana"
              }
            },
            vivienda: {
              tipo_vivienda: {
                id: "1",
                nombre: "Casa"
              },
              disposicion_basuras: {
                recolector: true,
                quemada: false,
                enterrada: false,
                recicla: true,
                aire_libre: false,
                no_aplica: false
              }
            },
            servicios_agua: {
              sistema_acueducto: {
                id: "1",
                nombre: "Acueducto Público"
              },
              aguas_residuales: "Alcantarillado",
              pozo_septico: false,
              letrina: false,
              campo_abierto: false
            },
            observaciones: {
              sustento_familia: "Test parroquia",
              observaciones_encuestador: "Prueba específica para parroquia",
              autorizacion_datos: true
            },
            familyMembers: [
              {
                nombres: "Test Parroquia",
                fechaNacimiento: "1990-01-01",
                numeroIdentificacion: "PARROQUIA" + Date.now(),
                tipoIdentificacion: "CC",
                sexo: "Masculino",
                situacionCivil: "Soltero",
                parentesco: "Jefe de Hogar",
                telefono: "3001234567",
                estudio: "Bachiller",
                comunidadCultural: "Ninguna",
                talla: {
                  camisa: "M",
                  pantalon: "32",
                  calzado: "42"
                }
              }
            ],
            deceasedMembers: [],
            metadata: {
              timestamp: new Date().toISOString(),
              completed: true,
              currentStage: 5
            }
          };

          console.log(`🏛️ Enviando parroquia: ID=${nuevaEncuesta.informacionGeneral.parroquia.id}, Nombre="${nuevaEncuesta.informacionGeneral.parroquia.nombre}"`);

          const createResponse = await fetch(`${API_BASE}/encuesta`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaEncuesta)
          });

          const createResult = await createResponse.json();
          
          if (createResponse.ok) {
            console.log('✅ Encuesta creada exitosamente');
            console.log(`  - ID Familia: ${createResult.data?.familia_id}`);
            
            // 3. Consultar la encuesta recién creada para verificar parroquia
            if (createResult.data?.familia_id) {
              console.log('\n3. 🔍 Consultando encuesta recién creada para verificar parroquia...');
              
              const consultaResponse = await fetch(`${API_BASE}/encuesta/${createResult.data.familia_id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              const consultaData = await consultaResponse.json();
              
              if (consultaResponse.ok) {
                console.log('✅ Consulta específica exitosa');
                console.log('🏛️ Información de parroquia obtenida:');
                console.log(JSON.stringify(consultaData.data.parroquia, null, 4));
                
                if (!consultaData.data.parroquia) {
                  console.log('❌ PROBLEMA CONFIRMADO: parroquia devuelve null');
                  console.log('  🔧 Esto necesita corrección en el controlador');
                } else if (consultaData.data.parroquia.id && consultaData.data.parroquia.nombre) {
                  console.log('✅ ÉXITO: parroquia se devuelve correctamente');
                  console.log(`  - ID: ${consultaData.data.parroquia.id}`);
                  console.log(`  - Nombre: "${consultaData.data.parroquia.nombre}"`);
                } else {
                  console.log('⚠️  PROBLEMA PARCIAL: parroquia existe pero incomplete');
                }
              } else {
                console.log('❌ Error en consulta específica:', consultaResponse.status);
              }
            }
          } else {
            console.log('❌ Error creando encuesta:', createResponse.status, createResult.message);
          }
          
        } else {
          console.log('❌ Error en consulta inicial:', response.status, data.message);
        }
        
      } catch (error) {
        console.error('❌ Error en prueba de parroquia:', error.message);
      }
    }
    
    const token = await login();
    if (!token) {
      console.log('❌ No se pudo obtener token. Abortando prueba.');
      return;
    }
    
    await probarProblemaParroquia(token);
    
    console.log('\n✅ PRUEBA DE PARROQUIA FINALIZADA');
    console.log('=' * 60);
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar
ejecutarPruebaParroquia().catch(console.error);
