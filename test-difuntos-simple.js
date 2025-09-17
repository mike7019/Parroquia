/**
 * Script simple para probar la inserción de datos de prueba en difuntos_familia
 */

import sequelize from './config/sequelize.js';

async function probarInserciones() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente.');
    
    // Verificar si hay familias
    console.log('\n📋 Verificando familias existentes...');
    const [familias] = await sequelize.query('SELECT id_familia FROM familias LIMIT 5');
    console.log(`✅ Familias encontradas: ${familias.length}`);
    
    if (familias.length === 0) {
      console.log('❌ No hay familias en la base de datos. Necesitas crear familias primero.');
      return;
    }
    
    // Verificar difuntos existentes
    console.log('\n📋 Verificando difuntos existentes...');
    const [difuntosExistentes] = await sequelize.query('SELECT COUNT(*) as count FROM difuntos_familia');
    console.log(`📊 Difuntos actuales: ${difuntosExistentes[0].count}`);
    
    // Solo insertar si no hay difuntos
    if (difuntosExistentes[0].count > 0) {
      console.log('ℹ️  Ya hay difuntos en la base de datos. Saltando inserción.');
      
      // Mostrar los difuntos existentes
      const [difuntos] = await sequelize.query(`
        SELECT id_difunto, nombre_completo, fecha_fallecimiento, id_familia_familias 
        FROM difuntos_familia 
        ORDER BY fecha_fallecimiento DESC
      `);
      
      console.log('\n📋 Difuntos existentes:');
      console.table(difuntos);
      
    } else {
      // Insertar datos de prueba
      console.log('\n🔧 Insertando datos de prueba...');
      
      const familiasDisponibles = familias.map(f => f.id_familia);
      console.log('Familias disponibles:', familiasDisponibles);
      
      const datosPrueba = [
        {
          nombre_completo: 'María González García',
          fecha_fallecimiento: '2023-03-15',
          observaciones: 'Madre de familia devota, siempre participaba en las actividades parroquiales',
          id_familia: familiasDisponibles[0] || 1
        },
        {
          nombre_completo: 'José Rodríguez Pérez (padre)',
          fecha_fallecimiento: '2022-11-20',
          observaciones: 'Padre de familia trabajador',
          id_familia: familiasDisponibles[1] || familiasDisponibles[0] || 1
        },
        {
          nombre_completo: 'Ana María López (madre)',
          fecha_fallecimiento: '2024-01-10',
          observaciones: 'Madre querida de la familia',
          id_familia: familiasDisponibles[0] || 1
        }
      ];
      
      for (const difunto of datosPrueba) {
        try {
          const [result] = await sequelize.query(`
            INSERT INTO difuntos_familia 
            (nombre_completo, fecha_fallecimiento, observaciones, id_familia_familias, "createdAt", "updatedAt") 
            VALUES 
            ('${difunto.nombre_completo}', '${difunto.fecha_fallecimiento}', '${difunto.observaciones}', ${difunto.id_familia}, NOW(), NOW())
            RETURNING id_difunto
          `);
          
          console.log(`✅ Insertado: ${difunto.nombre_completo} (ID: ${result[0]?.id_difunto})`);
        } catch (insertError) {
          console.error(`❌ Error insertando ${difunto.nombre_completo}:`, insertError.message);
        }
      }
    }
    
    // Probar consulta del servicio
    console.log('\n🧪 Probando consulta del servicio...');
    const [resultadoServicio] = await sequelize.query(`
      SELECT 
        df.id_difunto,
        df.nombre_completo,
        df.fecha_fallecimiento as fecha_aniversario,
        df.observaciones,
        f.apellido_familiar,
        CASE 
          WHEN df.nombre_completo ILIKE '%madre%' OR df.observaciones ILIKE '%madre%' THEN 'Madre'
          WHEN df.nombre_completo ILIKE '%padre%' OR df.observaciones ILIKE '%padre%' THEN 'Padre'
          ELSE 'Familiar'
        END as parentesco_inferido
      FROM difuntos_familia df
      LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
      ORDER BY df.fecha_fallecimiento DESC
      LIMIT 10
    `);
    
    console.log(`\n✅ Consulta exitosa. Encontrados: ${resultadoServicio.length} difuntos`);
    console.table(resultadoServicio);
    
    // Probar filtros específicos
    console.log('\n🧪 Probando filtro de madres...');
    const [madres] = await sequelize.query(`
      SELECT nombre_completo, observaciones 
      FROM difuntos_familia 
      WHERE (nombre_completo ILIKE '%madre%' OR observaciones ILIKE '%madre%')
    `);
    console.log(`Madres encontradas: ${madres.length}`);
    if (madres.length > 0) console.table(madres);
    
    console.log('\n🧪 Probando filtro de padres...');
    const [padres] = await sequelize.query(`
      SELECT nombre_completo, observaciones 
      FROM difuntos_familia 
      WHERE (nombre_completo ILIKE '%padre%' OR observaciones ILIKE '%padre%')
    `);
    console.log(`Padres encontrados: ${padres.length}`);
    if (padres.length > 0) console.table(padres);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔚 Conexión cerrada.');
  }
}

probarInserciones();
