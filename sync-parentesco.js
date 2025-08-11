import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

/**
 * Script para sincronizar el modelo de Parentesco con la base de datos
 */
async function syncParentescoModel() {
  try {
    console.log('🔄 Iniciando sincronización del modelo Parentesco...');
    
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente');
    
    // Cargar todos los modelos
    console.log('📦 Cargando todos los modelos...');
    await loadAllModels();
    console.log('✅ Modelos cargados exitosamente');
    
    // Sincronizar solo la tabla de parentescos
    console.log('🔄 Sincronizando tabla parentescos...');
    await sequelize.models.Parentesco.sync({ alter: true });
    console.log('✅ Tabla parentescos sincronizada exitosamente');
    
    // Mostrar información de la tabla creada
    const tableInfo = await sequelize.getQueryInterface().describeTable('parentescos');
    console.log('📋 Estructura de la tabla parentescos:');
    console.table(tableInfo);
    
    // Insertar datos de ejemplo si la tabla está vacía
    const count = await sequelize.models.Parentesco.count();
    if (count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      const parentescosEjemplo = [
        { nombre: 'Padre', descripcion: 'Padre biológico o adoptivo' },
        { nombre: 'Madre', descripcion: 'Madre biológica o adoptiva' },
        { nombre: 'Hijo', descripcion: 'Hijo biológico o adoptivo' },
        { nombre: 'Hija', descripcion: 'Hija biológica o adoptiva' },
        { nombre: 'Hermano', descripcion: 'Hermano biológico o adoptivo' },
        { nombre: 'Hermana', descripcion: 'Hermana biológica o adoptiva' },
        { nombre: 'Abuelo', descripcion: 'Abuelo paterno o materno' },
        { nombre: 'Abuela', descripcion: 'Abuela paterna o materna' },
        { nombre: 'Nieto', descripcion: 'Nieto por parte de hijo o hija' },
        { nombre: 'Nieta', descripcion: 'Nieta por parte de hijo o hija' },
        { nombre: 'Tío', descripcion: 'Tío paterno o materno' },
        { nombre: 'Tía', descripcion: 'Tía paterna o materna' },
        { nombre: 'Primo', descripcion: 'Primo hermano' },
        { nombre: 'Prima', descripcion: 'Prima hermana' },
        { nombre: 'Esposo', descripcion: 'Cónyuge masculino' },
        { nombre: 'Esposa', descripcion: 'Cónyuge femenino' },
        { nombre: 'Yerno', descripcion: 'Esposo de la hija' },
        { nombre: 'Nuera', descripcion: 'Esposa del hijo' },
        { nombre: 'Suegro', descripcion: 'Padre del cónyuge' },
        { nombre: 'Suegra', descripcion: 'Madre del cónyuge' },
        { nombre: 'Cuñado', descripcion: 'Hermano del cónyuge' },
        { nombre: 'Cuñada', descripcion: 'Hermana del cónyuge' },
        { nombre: 'Padrastro', descripcion: 'Nuevo esposo de la madre' },
        { nombre: 'Madrastra', descripcion: 'Nueva esposa del padre' },
        { nombre: 'Hijastro', descripcion: 'Hijo del cónyuge de una relación anterior' },
        { nombre: 'Hijastra', descripcion: 'Hija del cónyuge de una relación anterior' },
        { nombre: 'Hermanastro', descripcion: 'Hijo del padrastro o madrastra' },
        { nombre: 'Hermanastra', descripcion: 'Hija del padrastro o madrastra' },
        { nombre: 'Jefe de Familia', descripcion: 'Persona responsable principal del hogar' },
        { nombre: 'Otro', descripcion: 'Otro tipo de parentesco no especificado' }
      ];
      
      await sequelize.models.Parentesco.bulkCreate(parentescosEjemplo);
      console.log(`✅ Se insertaron ${parentescosEjemplo.length} registros de ejemplo`);
      
      // Mostrar los registros insertados
      const parentescos = await sequelize.models.Parentesco.findAll({
        order: [['nombre', 'ASC']]
      });
      
      console.log('\n📋 Parentescos insertados:');
      parentescos.forEach((parentesco, index) => {
        console.log(`   ${index + 1}. ${parentesco.nombre} - ${parentesco.descripcion}`);
      });
    } else {
      console.log(`ℹ️  La tabla ya contiene ${count} registros`);
    }
    
    console.log('\n🎉 Sincronización completada exitosamente');
    console.log('\n📚 Endpoints disponibles:');
    console.log('   • GET    /api/catalog/parentescos - Listar todos los parentescos');
    console.log('   • GET    /api/catalog/parentescos/stats - Obtener estadísticas');
    console.log('   • GET    /api/catalog/parentescos/:id - Obtener parentesco por ID');
    console.log('   • POST   /api/catalog/parentescos - Crear nuevo parentesco');
    console.log('   • PUT    /api/catalog/parentescos/:id - Actualizar parentesco');
    console.log('   • DELETE /api/catalog/parentescos/:id - Eliminar parentesco (soft delete)');
    console.log('   • PATCH  /api/catalog/parentescos/:id/restore - Restaurar parentesco eliminado');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar la conexión
    console.log('🔄 Cerrando conexión a la base de datos...');
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  }
}

// Ejecutar la sincronización
syncParentescoModel();
