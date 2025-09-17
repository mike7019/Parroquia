#!/usr/bin/env node

const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// Configuración de base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    timezone: '-05:00'
  }
);

async function testNameConcatenationFix() {
  try {
    console.log('🧪 Iniciando prueba de corrección de concatenación de nombres...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // 1. Verificar que no hay encuestas existentes
    console.log('📊 Verificando estado actual de la base de datos:');
    
    const [encuestasCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM encuestas
    `, { type: QueryTypes.SELECT });
    
    const [familiasCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM familias
    `, { type: QueryTypes.SELECT });
    
    const [personasCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM personas
    `, { type: QueryTypes.SELECT });

    console.log(`   - Encuestas: ${encuestasCount.total}`);
    console.log(`   - Familias: ${familiasCount.total}`);
    console.log(`   - Personas: ${personasCount.total}\n`);

    if (encuestasCount.total > 0) {
      console.log('⚠️ Hay encuestas existentes en la base de datos.');
      console.log('💡 Para probar correctamente, se recomienda ejecutar primero:');
      console.log('   node eliminar-encuestas-rapido.js\n');
    }

    // 2. Simular datos de prueba para verificar la lógica
    console.log('🧪 Probando lógica de separación de nombres:');
    
    // Función para parsear nombres (copiada del controller)
    function parseNombreCompleto(nombreCompleto) {
      if (!nombreCompleto || typeof nombreCompleto !== 'string') {
        return {
          primerNombre: '',
          segundoNombre: '',
          primerApellido: '',
          segundoApellido: ''
        };
      }

      const partes = nombreCompleto.trim().split(/\s+/);
      
      if (partes.length === 1) {
        return {
          primerNombre: partes[0],
          segundoNombre: '',
          primerApellido: '',
          segundoApellido: ''
        };
      } else if (partes.length === 2) {
        return {
          primerNombre: partes[0],
          segundoNombre: '',
          primerApellido: partes[1],
          segundoApellido: ''
        };
      } else if (partes.length === 3) {
        return {
          primerNombre: partes[0],
          segundoNombre: partes[1],
          primerApellido: partes[2],
          segundoApellido: ''
        };
      } else {
        // 4 o más partes: los primeros dos son nombres, los últimos dos son apellidos
        return {
          primerNombre: partes[0],
          segundoNombre: partes[1],
          primerApellido: partes[partes.length - 2],
          segundoApellido: partes[partes.length - 1]
        };
      }
    }

    // Casos de prueba
    const casosNombres = [
      'Juan García',
      'María Elena Rodríguez López',
      'Carlos Pérez',
      'Ana Lucía Martínez Gómez',
      'Pedro'
    ];

    const apellidoFamiliar = 'García López';

    console.log('📝 Casos de prueba:');
    console.log(`   Apellido familiar: "${apellidoFamiliar}"\n`);

    for (const nombreCompleto of casosNombres) {
      console.log(`   Nombre completo: "${nombreCompleto}"`);
      
      const parsed = parseNombreCompleto(nombreCompleto);
      
      console.log(`   🔍 Parsing:`)
      console.log(`      Primer nombre: "${parsed.primerNombre}"`);
      console.log(`      Segundo nombre: "${parsed.segundoNombre}"`);
      console.log(`      Primer apellido: "${parsed.primerApellido}"`);
      console.log(`      Segundo apellido: "${parsed.segundoApellido}"`);

      // Simular nombre completo final (como se mostraría)
      const nombreFinal = `${parsed.primerNombre || ''} ${parsed.segundoNombre || ''} ${parsed.primerApellido || ''} ${parsed.segundoApellido || ''}`.trim();
      
      console.log(`   ✅ Resultado final: "${nombreFinal}"`);
      console.log(`   ❌ Incorrecto (anterior): "${nombreCompleto} ${apellidoFamiliar}"`);
      console.log('');
    }

    // 3. Verificar que no hay concatenación duplicada
    console.log('🔍 Verificando que NO se duplican apellidos:');
    
    for (const nombreCompleto of casosNombres) {
      const parsed = parseNombreCompleto(nombreCompleto);
      const nombreFinal = `${parsed.primerNombre || ''} ${parsed.segundoNombre || ''} ${parsed.primerApellido || ''} ${parsed.segundoApellido || ''}`.trim();
      
      // Verificar que no contiene el apellido familiar duplicado
      const contieneDuplicacion = nombreFinal.includes(apellidoFamiliar);
      
      console.log(`   "${nombreCompleto}" → "${nombreFinal}"`);
      console.log(`   ¿Contiene duplicación? ${contieneDuplicacion ? '❌ SÍ (MALO)' : '✅ NO (BUENO)'}`);
    }

    console.log('\n✅ Prueba de lógica de nombres completada');
    console.log('💡 La lógica corregida evita la duplicación de apellidos familiares');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔚 Conexión cerrada');
  }
}

// Ejecutar la prueba
testNameConcatenationFix().catch(console.error);
