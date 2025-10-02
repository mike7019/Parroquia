import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
// Importar los modelos para que se registren en sequelize
import models from './src/models/index.js';

async function testFinalSituacionCivil() {
  console.log('🎯 Prueba final del servicio SituacionCivil corregido\n');

  try {
    // Esperar a que los modelos se carguen
    await sequelize.sync({ alter: false });

    // Test con nombre único
    console.log('📝 Creando situación civil: "Divorciado(a)"');
    const result = await SituacionCivilService.createSituacionCivil({
      nombre: "Divorciado(a)",
      descripcion: "Persona legalmente divorciada"
    });

    console.log('✅ Éxito! Situación civil creada:', {
      id: result.id_situacion_civil,
      nombre: result.nombre,
      descripcion: result.descripcion,
      codigo: result.codigo,
      orden: result.orden,
      activo: result.activo
    });

    // Test de obtener todas las situaciones civiles
    console.log('\n📋 Obteniendo todas las situaciones civiles...');
    const todas = await SituacionCivilService.getAllSituacionesCiviles();
    console.log(`✅ Total encontradas: ${todas.length}`);
    todas.forEach(sc => {
      console.log(`   - ID ${sc.id_situacion_civil}: ${sc.nombre} ${sc.activo ? '(Activo)' : '(Inactivo)'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testFinalSituacionCivil();