/**
 * Script para verificar el estado real de la tabla situaciones_civiles
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function verificarEstadoTabla() {
  console.log('🔍 VERIFICANDO ESTADO REAL DE LA TABLA');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // Verificar registros con paranoid false (todos los físicos)
    console.log('\n1️⃣ Registros físicos (paranoid: false):');
    const todosFisicos = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre', 'fechaEliminacion'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: false,
      raw: true
    });
    
    console.log(`   Total físicos: ${todosFisicos.length}`);
    todosFisicos.forEach(registro => {
      const estado = registro.fechaEliminacion ? 'SOFT DELETED' : 'ACTIVO';
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre} (${estado})`);
    });
    
    // Verificar registros activos
    console.log('\n2️⃣ Registros activos (paranoid: true):');
    const activos = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre'],
      order: [['id_situacion_civil', 'ASC']],
      raw: true
    });
    
    console.log(`   Total activos: ${activos.length}`);
    activos.forEach(registro => {
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre}`);
    });
    
    // Verificar secuencia actual
    console.log('\n3️⃣ Verificando secuencia AUTO_INCREMENT:');
    const [results] = await sequelize.query(
      "SELECT currval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil')) as current_value"
    );
    console.log('   Valor actual de secuencia:', results[0].current_value);
    
    // Verificar próximo valor de secuencia
    const [nextResults] = await sequelize.query(
      "SELECT nextval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil')) as next_value"
    );
    console.log('   Próximo valor de secuencia:', nextResults[0].next_value);
    
    // Resetear la secuencia correctamente
    console.log('\n4️⃣ Reseteando secuencia correctamente...');
    
    // Obtener el ID más alto
    const maxId = await SituacionCivil.max('id_situacion_civil', { paranoid: false });
    console.log('   ID más alto encontrado:', maxId);
    
    if (maxId) {
      // Setear la secuencia al siguiente valor después del más alto
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), ${maxId}, true)`
      );
      console.log(`   Secuencia ajustada a ${maxId} (próximo será ${maxId + 1})`);
    } else {
      // Si no hay registros, resetear a 1
      await sequelize.query(
        "SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), 1, false)"
      );
      console.log('   Secuencia reseteada a 1');
    }
    
    // Verificar nueva secuencia
    const [finalResults] = await sequelize.query(
      "SELECT currval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil')) as current_value"
    );
    console.log('   Valor final de secuencia:', finalResults[0].current_value);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }

  process.exit(0);
}

verificarEstadoTabla();