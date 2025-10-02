/**
 * Script para eliminar TODOS los registros de situación civil
 * PRECAUCIÓN: Esta operación es irreversible
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function eliminarTodosSituacionesCiviles() {
  console.log('🗑️ ELIMINANDO TODOS LOS REGISTROS DE SITUACIÓN CIVIL');
  console.log('⚠️  PRECAUCIÓN: Esta operación es IRREVERSIBLE');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // Paso 1: Mostrar registros actuales
    console.log('\n1️⃣ Registros actuales (todos, incluyendo eliminados):');
    const todosLosRegistros = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre', 'fechaEliminacion'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: false,
      raw: true
    });
    
    console.log(`   Total de registros físicos: ${todosLosRegistros.length}`);
    todosLosRegistros.forEach(registro => {
      const estado = registro.fechaEliminacion ? 'SOFT DELETED' : 'ACTIVO';
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre} (${estado})`);
    });
    
    if (todosLosRegistros.length === 0) {
      console.log('✅ No hay registros para eliminar');
      process.exit(0);
    }
    
    // Paso 2: Confirmar eliminación (simulamos confirmación automática)
    console.log('\n2️⃣ Procediendo con eliminación física COMPLETA...');
    
    // Paso 3: Eliminación física usando SQL directo
    console.log('\n3️⃣ Ejecutando eliminación física...');
    
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar TODOS los registros físicamente
      const [results] = await sequelize.query(
        'DELETE FROM situaciones_civiles',
        {
          type: sequelize.QueryTypes.DELETE,
          transaction
        }
      );
      
      await transaction.commit();
      
      console.log(`✅ ${results} registros eliminados físicamente`);
      
      // Paso 4: Verificar eliminación
      console.log('\n4️⃣ Verificando eliminación...');
      const verificacion = await SituacionCivil.findAll({
        paranoid: false,
        raw: true
      });
      
      if (verificacion.length === 0) {
        console.log('✅ CONFIRMADO: Tabla situaciones_civiles completamente vacía');
      } else {
        console.log(`❌ ERROR: Aún quedan ${verificacion.length} registros`);
      }
      
      // Paso 5: Resetear secuencia AUTO_INCREMENT (para PostgreSQL)
      console.log('\n5️⃣ Reseteando secuencia AUTO_INCREMENT...');
      await sequelize.query(
        "SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), 1, false)"
      );
      console.log('✅ Secuencia reseteada - próximo ID será 1');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('💥 Error durante eliminación:', error);
  }

  process.exit(0);
}

eliminarTodosSituacionesCiviles();