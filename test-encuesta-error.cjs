require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');

async function testEncuestaError() {
  console.log('🧪 TESTING ESPECÍFICO DEL ERROR DE ENCUESTA');
  console.log('═══════════════════════════════════════════');
  
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión DB establecida');

    // Simular el flujo de una encuesta que causa el error
    console.log('\n🔍 Simulando flujo de encuesta que causa el error...');
    
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Simular validación de miembros únicos
      console.log('1️⃣ Probando validación de miembros únicos...');
      
      const identificacionesTest = ['123456789', '987654321'];
      const personasExistentes = await sequelize.query(`
        SELECT 
          p.identificacion,
          p.primer_nombre,
          p.primer_apellido,
          p.id_familia_familias,
          f.apellido_familiar,
          f.id_familia
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        WHERE p.identificacion IN (:identificaciones)
      `, {
        replacements: { identificaciones: identificacionesTest },
        type: QueryTypes.SELECT,
        transaction
      });
      
      console.log(`  📊 Personas encontradas: ${personasExistentes.length}`);
      
      // 2. Simular creación de familia
      console.log('2️⃣ Probando creación de familia...');
      
      const [familiaTest] = await sequelize.query(`
        INSERT INTO familias (
          apellido_familiar, 
          sector, 
          direccion_familia, 
          tamaño_familia, 
          tipo_vivienda, 
          estado_encuesta, 
          numero_encuestas,
          fecha_ultima_encuesta
        ) 
        VALUES (
          'FAMILIA_TEST_ERROR', 
          'Sector Test', 
          'Dirección Test', 
          1, 
          'Casa', 
          'completed', 
          1,
          CURRENT_DATE
        ) 
        RETURNING id_familia, apellido_familiar
      `, {
        type: QueryTypes.SELECT,
        transaction
      });
      
      console.log(`  ✅ Familia test creada: ID ${familiaTest.id_familia}`);
      
      // 3. Simular creación de persona
      console.log('3️⃣ Probando creación de persona...');
      
      const [personaTest] = await sequelize.query(`
        INSERT INTO personas (
          primer_nombre,
          primer_apellido,
          identificacion,
          telefono,
          correo_electronico,
          fecha_nacimiento,
          direccion,
          id_familia_familias
        )
        VALUES (
          'Test',
          'Persona',
          'TEST_${Date.now()}',
          '3001234567',
          'test@test.com',
          '1990-01-01',
          'Dirección Test',
          $1
        )
        RETURNING id_personas, primer_nombre
      `, {
        bind: [familiaTest.id_familia],
        type: QueryTypes.SELECT,
        transaction
      });
      
      console.log(`  ✅ Persona test creada: ID ${personaTest.id_personas}`);
      
      // 4. Simular operaciones adicionales que podrían causar el error
      console.log('4️⃣ Probando operaciones que podrían causar conflicto...');
      
      // Verificar si hay columnas que no existen
      try {
        await sequelize.query(`
          SELECT numero_contrato_epm FROM familias WHERE id_familia = $1
        `, {
          bind: [familiaTest.id_familia],
          type: QueryTypes.SELECT,
          transaction
        });
        console.log('  ✅ Columna numero_contrato_epm existe');
      } catch (error) {
        console.log(`  ❌ Error con numero_contrato_epm: ${error.message}`);
      }
      
      // Verificar si hay problemas con referencias
      try {
        await sequelize.query(`
          SELECT COUNT(*) as total FROM personas WHERE id_familia_familias = $1
        `, {
          bind: [familiaTest.id_familia],
          type: QueryTypes.SELECT,
          transaction
        });
        console.log('  ✅ Referencias FK funcionan');
      } catch (error) {
        console.log(`  ❌ Error con FK: ${error.message}`);
      }
      
      // 5. Intentar commit
      console.log('5️⃣ Intentando commit...');
      await transaction.commit();
      console.log('  ✅ Commit exitoso');
      
      // 6. Limpiar datos de prueba
      console.log('6️⃣ Limpiando datos de prueba...');
      await sequelize.query(`DELETE FROM personas WHERE id_familia_familias = ${familiaTest.id_familia}`);
      await sequelize.query(`DELETE FROM familias WHERE id_familia = ${familiaTest.id_familia}`);
      console.log('  ✅ Datos de prueba eliminados');
      
    } catch (error) {
      console.log(`\n❌ ERROR EN TRANSACCIÓN: ${error.message}`);
      console.log(`   Código de error: ${error.code || 'N/A'}`);
      console.log(`   Detalle: ${error.detail || 'N/A'}`);
      console.log(`   Hint: ${error.hint || 'N/A'}`);
      
      try {
        await transaction.rollback();
        console.log('✅ Rollback completado');
      } catch (rollbackError) {
        console.log(`❌ Error en rollback: ${rollbackError.message}`);
      }
      
      throw error;
    }

    console.log('\n✅ PRUEBA COMPLETADA - No se reprodujo el error');

  } catch (error) {
    console.error(`\n❌ ERROR PRINCIPAL: ${error.message}`);
    
    // Si el error es "current transaction is aborted", investigar más
    if (error.message.includes('current transaction is aborted')) {
      console.log('\n🔍 INVESTIGANDO ERROR DE TRANSACCIÓN ABORTADA...');
      
      // Verificar el estado de la conexión
      try {
        const [state] = await sequelize.query(`
          SELECT 
            pg_backend_pid() as pid,
            current_setting('transaction_isolation') as isolation,
            current_setting('transaction_read_only') as read_only
        `);
        console.log('Estado de conexión:', state);
      } catch (stateError) {
        console.log(`Error verificando estado: ${stateError.message}`);
      }
    }
    
  } finally {
    await sequelize.close();
  }
}

testEncuestaError();
