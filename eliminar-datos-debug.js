/**
 * Script de eliminación con debugging mejorado
 */

import sequelize from './config/sequelize.js';

async function eliminarDatosConDebug() {
  try {
    console.log('🔍 Iniciando eliminación con debugging...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Verificar datos antes
    console.log('\n📊 Datos ANTES de eliminar:');
    const tablasVerificar = ['encuestas', 'familias', 'personas', 'difuntos_familia', 'familia_sistema_acueducto'];
    
    for (const tabla of tablasVerificar) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        console.log(`${tabla}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`${tabla}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n🔧 Deshabilitando restricciones...');
    await sequelize.query('SET session_replication_role = replica;');
    console.log('✅ Restricciones deshabilitadas');
    
    // Eliminar tabla por tabla con debugging
    const tablasEliminar = [
      'difuntos_familia',
      'personas', 
      'familia_sistema_acueducto',
      'familia_tipo_vivienda',
      'familias',
      'encuestas'
    ];
    
    console.log('\n🗑️  Iniciando eliminación...');
    
    for (const tabla of tablasEliminar) {
      try {
        console.log(`\n🔄 Procesando tabla: ${tabla}`);
        
        // Verificar si existe
        const [existe] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = '${tabla}' AND table_schema = 'public'
        `);
        
        if (existe[0].count === '0') {
          console.log(`❌ Tabla ${tabla} no existe`);
          continue;
        }
        
        // Contar registros
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const registros = parseInt(count[0].count);
        console.log(`📋 ${tabla} tiene ${registros} registros`);
        
        if (registros > 0) {
          // Eliminar
          const resultado = await sequelize.query(`DELETE FROM ${tabla}`, {
            logging: console.log // Mostrar SQL
          });
          console.log(`✅ ${tabla}: ${registros} registros eliminados`);
          console.log(`📄 Resultado:`, resultado[1]);
        } else {
          console.log(`ℹ️  ${tabla} ya estaba vacía`);
        }
        
      } catch (error) {
        console.error(`❌ Error eliminando ${tabla}:`, error.message);
        console.error('Stack:', error.stack);
      }
    }
    
    // Rehabilitar restricciones
    console.log('\n🔧 Rehabilitando restricciones...');
    await sequelize.query('SET session_replication_role = DEFAULT;');
    console.log('✅ Restricciones rehabilitadas');
    
    // Verificar después
    console.log('\n📊 Datos DESPUÉS de eliminar:');
    for (const tabla of tablasVerificar) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        console.log(`${tabla}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`${tabla}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔚 Conexión cerrada');
  }
}

eliminarDatosConDebug();
