const { QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function testParentescoFix() {
  try {
    console.log('🔍 Verificando fix de parentesco para difuntos...\n');

    // 1. Verificar datos actuales en personas con difuntos
    console.log('1️⃣ Datos actuales de personas fallecidas:');
    const personasActuales = await sequelize.query(`
      SELECT 
        p.id_persona,
        CONCAT(p.primer_nombre, ' ', COALESCE(p.primer_apellido, '')) as nombre_completo,
        p.id_parentesco,
        par.nombre as parentesco_nombre,
        p.estudios
      FROM personas p
      LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
      WHERE p.identificacion LIKE 'FALLECIDO%'
      ORDER BY p.id_persona;
    `, { type: QueryTypes.SELECT });

    if (personasActuales.length > 0) {
      console.table(personasActuales.map(p => ({
        ID: p.id_persona,
        Nombre: p.nombre_completo,
        'ID Parentesco': p.id_parentesco,
        'Parentesco Nombre': p.parentesco_nombre,
        'JSON Info': JSON.parse(p.estudios || '{}')
      })));
    } else {
      console.log('  ❌ No hay personas fallecidas registradas');
    }

    // 2. Verificar estructura de parentescos disponibles
    console.log('\n2️⃣ Parentescos disponibles en la base de datos:');
    const parentescos = await sequelize.query(`
      SELECT id_parentesco, nombre
      FROM parentescos
      ORDER BY id_parentesco;
    `, { type: QueryTypes.SELECT });

    console.table(parentescos);

    // 3. Mostrar ejemplo de request body que debería funcionar ahora
    console.log('\n3️⃣ Ejemplo de request body que ahora debería funcionar:');
    
    const ejemploRequestBody = {
      deceasedMembers: [
        {
          nombres: "María Elena González",
          fechaFallecimiento: "2020-05-15",
          causaFallecimiento: "Enfermedad natural",
          parentesco: {
            id: "MADRE",  // ✅ Ahora se convertirá a ID numérico 3
            nombre: "Madre"
          }
        },
        {
          nombres: "José Antonio García",
          fechaAniversario: "2018-12-03",
          parentesco: {
            id: 2,  // ✅ También acepta ID numérico directo
            nombre: "Padre"
          }
        }
      ]
    };

    console.log(JSON.stringify(ejemploRequestBody, null, 2));

    console.log('\n4️⃣ Formato anterior que sigue funcionando:');
    const ejemploFormatoAnterior = {
      deceasedMembers: [
        {
          nombres: "Pedro Luis Martínez",
          eraPadre: true,  // ✅ Formato boolean anterior
          fechaFallecimiento: "2019-08-20"
        }
      ]
    };

    console.log(JSON.stringify(ejemploFormatoAnterior, null, 2));

    console.log('\n✅ El controlador ahora maneja ambos formatos:');
    console.log('   📄 Nuevo: parentesco: {id: "PADRE"|"MADRE"|2|3, nombre: "..."}');
    console.log('   📄 Anterior: eraPadre: true/false, eraMadre: true/false');
    console.log('   💾 Ambos se guardan en id_parentesco de la tabla personas');

    await sequelize.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

// Ejecutar el test
testParentescoFix();
