/**/**

 * Test completo del servicio corregido * TEST DE VALIDACIÓN DESPUÉS DE CORRECCIONES

 */ * 

 * Prueba el servicio corregido para verificar que ahora

import './src/models/index.js'; * muestre correctamente los datos de catálogo en lugar de "No especificado"

import SituacionCivilService from './src/services/situacionCivilService.js'; */



async function testCompleto() {import sequelize from './config/sequelize.js';

  console.log('🧪 TEST COMPLETO DEL SERVICIO CORREGIDO');

  async function testServicioCorregido() {

  try {  console.log('🧪 === TEST SERVICIO CORREGIDO ===\n');

    // Limpiar el registro de prueba  

    console.log('\n1️⃣ Limpiando registro de prueba...');  try {

    try {    await sequelize.authenticate();

      await SituacionCivilService.deleteSituacionCivil(12);    console.log('✅ Conexión establecida');

      console.log('✅ Registro de prueba eliminado');    

    } catch (error) {    // Test 1: Consulta tipo de vivienda corregida

      console.log('ℹ️ No había registro de prueba que limpiar');    console.log('\n🏠 TEST 1: Tipo de vivienda');

    }    

    const queryVivienda = `

    // Test 1: Crear nuevo registro      SELECT 

    console.log('\n2️⃣ Creando nuevo registro...');        f.tipo_vivienda as campo_directo,

    const nuevoRegistro = await SituacionCivilService.createSituacionCivil({        f.id_tipo_vivienda as campo_fk,

      nombre: 'Estado de Prueba Corregido',        COALESCE(

      descripcion: 'Descripción de prueba para verificar corrección'          tv1.nombre, 

    });          tv2.nombre, 

              CASE 

    console.log('✅ Registro creado exitosamente:');            WHEN f.tipo_vivienda IS NOT NULL THEN f.tipo_vivienda

    console.log('   ID:', nuevoRegistro.id);            ELSE 'No especificado'

    console.log('   Nombre:', nuevoRegistro.nombre);          END

        ) as tipo_vivienda_resultado

    // Test 2: Eliminar el registro (eliminación física)      FROM familias f

    console.log('\n3️⃣ Eliminando registro físicamente...');      LEFT JOIN tipos_vivienda tv1 ON f.id_tipo_vivienda = tv1.id_tipo_vivienda

    await SituacionCivilService.deleteSituacionCivil(nuevoRegistro.id);      LEFT JOIN tipos_vivienda tv2 ON f.tipo_vivienda::text = tv2.id_tipo_vivienda::text

    console.log('✅ Registro eliminado exitosamente');      WHERE f.id_familia = 11

    `;

    // Test 3: Crear otro registro para verificar reutilización    

    console.log('\n4️⃣ Creando otro registro para verificar reutilización...');    const [vivienda] = await sequelize.query(queryVivienda);

    const registroReutilizado = await SituacionCivilService.createSituacionCivil({    console.log('Resultado tipo vivienda:', vivienda[0]);

      nombre: 'Estado Reutilizado',    

      descripcion: 'Este registro debería reutilizar el ID anterior'    // Test 2: Consulta estado civil corregida

    });    console.log('\n👤 TEST 2: Estado civil');

        

    console.log('✅ Registro con ID reutilizado creado:');    const queryEstadoCivil = `

    console.log('   ID:', registroReutilizado.id);      SELECT 

    console.log('   Nombre:', registroReutilizado.nombre);        p.primer_nombre,

            p.id_estado_civil_estado_civil,

    if (registroReutilizado.id === nuevoRegistro.id) {        ec.id_estado,

      console.log('🎉 ÉXITO: ID reutilizado correctamente!');        COALESCE(ec.descripcion, 'No especificado') as estado_civil_resultado

    } else {      FROM personas p

      console.log('⚠️ ID no fue reutilizado - puede estar funcionando secuencialmente');      LEFT JOIN estados_civiles ec ON p.id_estado_civil_estado_civil = ec.id_estado

    }      WHERE p.id_familia_familias = 11

      LIMIT 2

    // Limpiar el último registro    `;

    console.log('\n5️⃣ Limpiando registro final...');    

    await SituacionCivilService.deleteSituacionCivil(registroReutilizado.id);    const estadosCiviles = await sequelize.query(queryEstadoCivil, {

    console.log('✅ Test completado y limpiado');      type: sequelize.QueryTypes.SELECT

    });

  } catch (error) {    

    console.error('💥 Error en test:', error.message);    estadosCiviles.forEach(persona => {

  }      console.log(`${persona.primer_nombre}: ${persona.estado_civil_resultado} (ID: ${persona.id_estado_civil_estado_civil})`);

    });

  process.exit(0);    

}    // Test 3: Consulta completa simulando el servicio

    console.log('\n🔍 TEST 3: Simulación servicio completo');

testCompleto();    
    const queryCompleta = `
      SELECT 
        -- Datos básicos
        f.id_familia,
        f.apellido_familiar,
        
        -- Tipo de vivienda corregido
        COALESCE(
          tv1.nombre, 
          tv2.nombre, 
          CASE 
            WHEN f.tipo_vivienda IS NOT NULL THEN f.tipo_vivienda
            ELSE 'No especificado'
          END
        ) as tipo_vivienda,
        
        -- Otros servicios (por ahora mantener como "No especificado")
        'No especificado' as disposicion_basura,
        'No especificado' as tipos_agua_residuales,
        'No especificado' as sistema_acueducto
        
      FROM familias f
      LEFT JOIN tipos_vivienda tv1 ON f.id_tipo_vivienda = tv1.id_tipo_vivienda
      LEFT JOIN tipos_vivienda tv2 ON f.tipo_vivienda::text = tv2.id_tipo_vivienda::text
      WHERE f.id_familia = 11
    `;
    
    const [familiaCompleta] = await sequelize.query(queryCompleta);
    console.log('Familia con datos corregidos:', familiaCompleta[0]);
    
    // Test 4: Verificar si el cambio solucionó el problema
    const tipoViviendaCorregido = familiaCompleta[0].tipo_vivienda !== 'No especificado';
    
    console.log('\n📊 RESULTADOS:');
    console.log(`✅ Tipo de vivienda corregido: ${tipoViviendaCorregido ? 'SÍ' : 'NO'} (${familiaCompleta[0].tipo_vivienda})`);
    console.log(`✅ Estados civiles funcionando: ${estadosCiviles.every(p => p.estado_civil_resultado !== 'No especificado') ? 'SÍ' : 'PARCIAL'}`);
    
    if (tipoViviendaCorregido) {
      console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
      console.log('El servicio ahora muestra datos reales en lugar de "No especificado"');
    } else {
      console.log('\n⚠️ Aún hay problemas por resolver');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

testServicioCorregido();