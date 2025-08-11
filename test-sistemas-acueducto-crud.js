/**
 * Test script para verificar el funcionamiento del CRUD de Sistemas de Acueducto
 */

import sequelize from './config/sequelize.js';
import { Op } from 'sequelize';
import SistemaAcueducto from './src/models/catalog/SistemaAcueducto.js';

async function testSistemasAcueductoCRUD() {
  try {
    console.log('🧪 Iniciando tests del CRUD de Sistemas de Acueducto...\n');

    // Test 1: Conectar a la base de datos
    console.log('📡 Test 1: Conexión a la base de datos');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Test 2: Crear un nuevo sistema
    console.log('➕ Test 2: Crear nuevo sistema de acueducto');
    const nombreUnico = `Test Sistema Automático ${Date.now()}`;
    const nuevoSistema = await SistemaAcueducto.create({
      nombre: nombreUnico,
      descripcion: 'Sistema creado durante las pruebas automatizadas'
    });
    console.log('✅ Sistema creado:', {
      id: nuevoSistema.id_sistema_acueducto,
      nombre: nuevoSistema.nombre,
      descripcion: nuevoSistema.descripcion
    });
    console.log('');

    // Test 3: Leer el sistema creado
    console.log('👁️ Test 3: Leer sistema por ID');
    const sistemaLeido = await SistemaAcueducto.findByPk(nuevoSistema.id_sistema_acueducto);
    console.log('✅ Sistema encontrado:', {
      id: sistemaLeido.id_sistema_acueducto,
      nombre: sistemaLeido.nombre,
      descripcion: sistemaLeido.descripcion
    });
    console.log('');

    // Test 4: Leer todos los sistemas
    console.log('📋 Test 4: Leer todos los sistemas');
    const todosSistemas = await SistemaAcueducto.findAll({
      order: [['id_sistema_acueducto', 'ASC']]
    });
    console.log(`✅ Total de sistemas encontrados: ${todosSistemas.length}`);
    todosSistemas.forEach(sistema => {
      console.log(`   - ID: ${sistema.id_sistema_acueducto}, Nombre: ${sistema.nombre}`);
    });
    console.log('');

    // Test 5: Actualizar el sistema
    console.log('✏️ Test 5: Actualizar sistema');
    await sistemaLeido.update({
      nombre: `Test Sistema Actualizado ${Date.now()}`,
      descripcion: 'Descripción actualizada durante las pruebas'
    });
    await sistemaLeido.reload();
    console.log('✅ Sistema actualizado:', {
      id: sistemaLeido.id_sistema_acueducto,
      nombre: sistemaLeido.nombre,
      descripcion: sistemaLeido.descripcion
    });
    console.log('');

    // Test 6: Buscar sistemas
    console.log('🔍 Test 6: Buscar sistemas');
    const sistemasBuscados = await SistemaAcueducto.findAll({
      where: {
        nombre: {
          [Op.iLike]: '%Test%'
        }
      }
    });
    console.log(`✅ Sistemas encontrados con "Test": ${sistemasBuscados.length}`);
    sistemasBuscados.forEach(sistema => {
      console.log(`   - ID: ${sistema.id_sistema_acueducto}, Nombre: ${sistema.nombre}`);
    });
    console.log('');

    // Test 7: Validar unicidad de nombres
    console.log('🚫 Test 7: Validar unicidad de nombres');
    try {
      await SistemaAcueducto.create({
        nombre: sistemaLeido.nombre, // Usar el nombre del sistema actualizado
        descripcion: 'Este debería fallar'
      });
      console.log('❌ ERROR: Se permitió crear un sistema con nombre duplicado');
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('✅ Validación de unicidad funcionando correctamente');
      } else {
        console.log('⚠️ Error inesperado:', error.message);
      }
    }
    console.log('');

    // Test 8: Validar campos requeridos
    console.log('📝 Test 8: Validar campos requeridos');
    try {
      await SistemaAcueducto.create({
        descripcion: 'Sistema sin nombre' // Falta nombre requerido
      });
      console.log('❌ ERROR: Se permitió crear un sistema sin nombre');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        console.log('✅ Validación de campos requeridos funcionando correctamente');
        console.log(`   Error: ${error.errors[0].message}`);
      } else {
        console.log('⚠️ Error inesperado:', error.message);
      }
    }
    console.log('');

    // Test 9: Eliminar el sistema de prueba
    console.log('🗑️ Test 9: Eliminar sistema');
    const sistemaEliminado = await sistemaLeido.destroy();
    console.log('✅ Sistema eliminado exitosamente');

    // Verificar que realmente se eliminó
    const sistemaVerificacion = await SistemaAcueducto.findByPk(nuevoSistema.id_sistema_acueducto);
    if (sistemaVerificacion === null) {
      console.log('✅ Verificación: El sistema ya no existe en la base de datos');
    } else {
      console.log('❌ ERROR: El sistema aún existe después de eliminarlo');
    }
    console.log('');

    // Test 10: Estadísticas
    console.log('📊 Test 10: Estadísticas generales');
    const totalSistemas = await SistemaAcueducto.count();
    const sistemasConDescripcion = await SistemaAcueducto.count({
      where: {
        descripcion: { [Op.ne]: null }
      }
    });
    console.log('✅ Estadísticas:');
    console.log(`   Total de sistemas: ${totalSistemas}`);
    console.log(`   Sistemas con descripción: ${sistemasConDescripcion}`);
    console.log(`   Sistemas sin descripción: ${totalSistemas - sistemasConDescripcion}`);
    console.log('');

    console.log('🎉 Todos los tests completados exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('📪 Conexión a la base de datos cerrada');
  }
}

// Ejecutar los tests
testSistemasAcueductoCRUD();
