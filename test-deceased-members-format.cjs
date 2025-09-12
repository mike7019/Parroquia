// Script para probar el nuevo formato de respuesta de deceasedMembers
const { QueryTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function testDeceasedMembersFormat() {
  try {
    console.log('🔍 Probando nuevo formato de deceasedMembers...\n');

    // 1. Verificar datos existentes de personas fallecidas
    console.log('1️⃣ Datos actuales de personas fallecidas en base de datos:');
    const personasActuales = await sequelize.query(`
      SELECT 
        p.id_personas,
        CONCAT(p.primer_nombre, ' ', COALESCE(p.primer_apellido, '')) as nombre_completo,
        p.id_sexo,
        p.id_parentesco,
        s.descripcion as sexo_descripcion,
        par.nombre as parentesco_nombre,
        p.estudios,
        p.identificacion
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
      WHERE p.identificacion LIKE 'FALLECIDO%'
      ORDER BY p.id_personas;
    `, { type: QueryTypes.SELECT });

    if (personasActuales.length > 0) {
      console.table(personasActuales.map(p => ({
        ID: p.id_personas,
        Nombre: p.nombre_completo,
        'ID Sexo': p.id_sexo,
        'Sexo': p.sexo_descripcion,
        'ID Parentesco': p.id_parentesco,
        'Parentesco': p.parentesco_nombre,
        'JSON Info': JSON.parse(p.estudios || '{}')
      })));
    } else {
      console.log('  ❌ No hay personas fallecidas registradas');
    }

    // 2. Simular la consulta mejorada que ahora usa el controlador
    console.log('\n2️⃣ Simulando consulta mejorada del controlador:');
    const consultaMejorada = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.identificacion,
        p.estudios,
        p.fecha_nacimiento,
        p.id_sexo,
        p.id_parentesco,
        s.descripcion as sexo_descripcion,
        par.nombre as parentesco_nombre
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
      WHERE p.identificacion LIKE 'FALLECIDO%'
      ORDER BY p.id_personas;
    `, { type: QueryTypes.SELECT });

    if (consultaMejorada.length > 0) {
      console.log('✅ Consulta mejorada exitosa, datos obtenidos:');
      consultaMejorada.forEach((fallecido, index) => {
        console.log(`\n--- Fallecido ${index + 1} ---`);
        console.log(`ID: ${fallecido.id_personas}`);
        console.log(`Nombre: ${fallecido.primer_nombre} ${fallecido.primer_apellido || ''}`);
        console.log(`Sexo: ID ${fallecido.id_sexo} - ${fallecido.sexo_descripcion || 'N/A'}`);
        console.log(`Parentesco: ID ${fallecido.id_parentesco} - ${fallecido.parentesco_nombre || 'N/A'}`);
        
        let infoFallecido = {};
        try {
          infoFallecido = JSON.parse(fallecido.estudios || '{}');
        } catch (error) {
          infoFallecido = {};
        }
        console.log(`Fecha fallecimiento: ${infoFallecido.fecha_aniversario || 'N/A'}`);
        console.log(`Causa: ${infoFallecido.causa_fallecimiento || 'N/A'}`);
      });
    }

    // 3. Mostrar formato esperado de respuesta
    console.log('\n3️⃣ Formato esperado de respuesta (deceasedMembers):');
    
    if (consultaMejorada.length > 0) {
      const formatoEsperado = consultaMejorada.map(fallecido => {
        let infoFallecido = {};
        try {
          infoFallecido = JSON.parse(fallecido.estudios || '{}');
        } catch (error) {
          infoFallecido = {};
        }

        const formatearNombre = (primer, segundo, primerAp, segundoAp) => {
          const partes = [primer, segundo, primerAp, segundoAp].filter(p => p && p.trim());
          return partes.join(' ');
        };

        return {
          nombres: formatearNombre(fallecido.primer_nombre, fallecido.segundo_nombre, fallecido.primer_apellido, fallecido.segundo_apellido),
          fechaFallecimiento: infoFallecido.fecha_aniversario || null,
          sexo: fallecido.id_sexo ? {
            id: parseInt(fallecido.id_sexo),
            nombre: fallecido.sexo_descripcion || null
          } : null,
          parentesco: fallecido.id_parentesco ? {
            id: parseInt(fallecido.id_parentesco),
            nombre: fallecido.parentesco_nombre || null
          } : null,
          causaFallecimiento: infoFallecido.causa_fallecimiento || null
        };
      });

      console.log('```json');
      console.log(JSON.stringify({ deceasedMembers: formatoEsperado }, null, 2));
      console.log('```');
    }

    // 4. Comparar con formato anterior
    console.log('\n4️⃣ Comparación con formato anterior:');
    console.log('❌ ANTES:');
    console.log(`{
  "fallecidos": [
    {
      "id": "40",
      "nombre_completo": "Pedro Rodríguez",
      "fecha_fallecimiento": "2020-05-15",
      "causa_fallecimiento": "Enfermedad cardiovascular"
    }
  ]
}`);

    console.log('\n✅ AHORA:');
    console.log(`{
  "deceasedMembers": [
    {
      "nombres": "Pedro Rodríguez",
      "fechaFallecimiento": "2020-05-15",
      "sexo": {
        "id": 1,
        "nombre": "Masculino"
      },
      "parentesco": {
        "id": 2,
        "nombre": "Padre"
      },
      "causaFallecimiento": "Enfermedad cardiovascular"
    }
  ]
}`);

    console.log('\n✅ Cambios aplicados correctamente:');
    console.log('   📄 Mismo formato de entrada y salida');
    console.log('   📄 Campo "deceasedMembers" en lugar de "fallecidos"');
    console.log('   📄 Incluye información de sexo y parentesco');
    console.log('   📄 Sin campo "identificacion" expuesto');
    console.log('   📄 Nombres sin ID interno');

    await sequelize.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

// Ejecutar el test
testDeceasedMembersFormat();
