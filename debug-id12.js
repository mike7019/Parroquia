/**
 * Script para verificar el estado real del ID 12
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function verificarID12() {
  console.log('🔍 VERIFICANDO ESTADO DEL ID 12');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // Buscar ID 12 con paranoid false (incluye eliminados)
    console.log('\n1️⃣ Buscando ID 12 con paranoid: false...');
    const registro12Fisico = await SituacionCivil.findByPk(12, { paranoid: false });
    
    if (registro12Fisico) {
      console.log('❌ ID 12 EXISTE FÍSICAMENTE:');
      console.log('   - Nombre:', registro12Fisico.nombre);
      console.log('   - Activo:', registro12Fisico.activo);
      console.log('   - fechaEliminacion:', registro12Fisico.fechaEliminacion);
      console.log('   - Está soft deleted:', !!registro12Fisico.fechaEliminacion);
    } else {
      console.log('✅ ID 12 NO existe físicamente');
    }
    
    // Buscar ID 12 con paranoid true (solo activos)
    console.log('\n2️⃣ Buscando ID 12 con paranoid: true...');
    const registro12Activo = await SituacionCivil.findByPk(12, { paranoid: true });
    
    if (registro12Activo) {
      console.log('❌ ID 12 aparece como ACTIVO (problema!)');
    } else {
      console.log('✅ ID 12 NO aparece en registros activos');
    }
    
    // Ver todos los IDs físicos
    console.log('\n3️⃣ Todos los IDs físicos (paranoid: false)...');
    const todosLosIds = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre', 'fechaEliminacion'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: false,
      raw: true
    });
    
    console.log('IDs físicamente existentes:');
    todosLosIds.forEach(registro => {
      const estado = registro.fechaEliminacion ? 'SOFT DELETED' : 'ACTIVO';
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre} (${estado})`);
    });
    
    // Ver solo IDs activos
    console.log('\n4️⃣ Solo IDs activos (paranoid: true)...');
    const idsActivos = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: true,
      raw: true
    });
    
    console.log('IDs activos:');
    idsActivos.forEach(registro => {
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre}`);
    });
    
    // Simular algoritmo de detección de gaps
    console.log('\n5️⃣ Simulando algoritmo de gaps...');
    const idsActivosSimples = idsActivos.map(r => r.id_situacion_civil).sort((a, b) => a - b);
    console.log('   IDs activos ordenados:', idsActivosSimples);
    
    for (let i = 1; i <= idsActivosSimples[idsActivosSimples.length - 1]; i++) {
      if (!idsActivosSimples.includes(i)) {
        console.log(`   🔄 Gap detectado en ID ${i}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }

  process.exit(0);
}

verificarID12();