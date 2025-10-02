import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function analizarEliminados() {
  console.log('🔍 ANALIZANDO REGISTROS ELIMINADOS\n');

  try {
    await sequelize.sync({ alter: false });

    const SituacionCivil = sequelize.models.SituacionCivil;

    // Obtener TODOS los registros (incluyendo eliminados)
    console.log('1️⃣ TODOS LOS REGISTROS (incluidos eliminados)');
    const todos = await SituacionCivil.findAll({
      paranoid: false, // Incluir eliminados
      order: [['id_situacion_civil', 'ASC']]
    });

    todos.forEach(sc => {
      const estado = sc.fechaEliminacion ? '(SOFT DELETED)' : sc.activo ? '(ACTIVO)' : '(INACTIVO)';
      console.log(`   ID ${sc.id_situacion_civil}: ${sc.nombre} ${estado} - deletedAt: ${sc.deletedAt || 'null'}`);
    });

    // Obtener solo los activos
    console.log('\n2️⃣ SOLO REGISTROS ACTIVOS');
    const activos = await SituacionCivil.findAll({
      paranoid: true, // Solo no eliminados
      order: [['id_situacion_civil', 'ASC']]
    });

    activos.forEach(sc => {
      console.log(`   ID ${sc.id_situacion_civil}: ${sc.nombre} (ACTIVO)`);
    });

    // Analizar IDs
    console.log('\n3️⃣ ANÁLISIS DE IDs');
    const idsUsados = todos.map(sc => sc.id_situacion_civil).sort((a, b) => a - b);
    const idsActivos = activos.map(sc => sc.id_situacion_civil).sort((a, b) => a - b);
    
    console.log(`   📊 IDs totales usados: [${idsUsados.join(', ')}]`);
    console.log(`   📊 IDs activos: [${idsActivos.join(', ')}]`);
    
    // Buscar gaps en IDs totales
    const gaps = [];
    for (let i = 1; i <= Math.max(...idsUsados); i++) {
      if (!idsUsados.includes(i)) {
        gaps.push(i);
      }
    }
    
    console.log(`   📊 Gaps en secuencia total: [${gaps.join(', ') || 'Ninguno'}]`);

    // Buscar IDs de eliminados que podrían reutilizarse
    const eliminados = todos.filter(sc => sc.fechaEliminacion).map(sc => sc.id_situacion_civil);
    console.log(`   📊 IDs eliminados (soft): [${eliminados.join(', ') || 'Ninguno'}]`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

analizarEliminados();