import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

(async () => {
  try {
    console.log('🔄 Iniciando sincronización de modelos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Sincronizar modelos (alter: true para modificar tablas existentes)
    await sequelize.sync({ 
      alter: true,  // Modifica columnas existentes si es necesario
      force: false  // No eliminar datos
    });
    
    console.log('✅ Modelos sincronizados correctamente');
    
    // Verificar específicamente el modelo Familias
    console.log('\n🔍 Verificando modelo Familias...');
    const familiaModel = models.Familias;
    
    if (familiaModel) {
      console.log('✅ Modelo Familias cargado correctamente');
      console.log('📋 Atributos:', Object.keys(familiaModel.rawAttributes));
      
      // Verificar el atributo id_familia
      const idFamiliaAttr = familiaModel.rawAttributes.id_familia;
      if (idFamiliaAttr) {
        console.log('✅ Atributo id_familia configurado:');
        console.log(`   - Tipo: ${idFamiliaAttr.type.constructor.name}`);
        console.log(`   - Primary Key: ${idFamiliaAttr.primaryKey}`);
        console.log(`   - Auto Increment: ${idFamiliaAttr.autoIncrement}`);
        console.log(`   - Allow Null: ${idFamiliaAttr.allowNull}`);
      }
    } else {
      console.log('❌ Modelo Familias no encontrado');
    }
    
    // Test simple de creación (para verificar que funcione)
    console.log('\n🧪 Probando creación de familia de prueba...');
    const testFamilia = await familiaModel.create({
      apellido_familiar: 'TEST_FAMILIA_SYNC',
      sector: 'TEST_SECTOR',
      direccion_familia: 'TEST DIRECCION',
      tamaño_familia: 1,
      tipo_vivienda: 'Casa',
    });
    
    console.log(`✅ Familia de prueba creada con ID: ${testFamilia.id_familia}`);
    
    // Eliminar la familia de prueba
    await testFamilia.destroy();
    console.log('🗑️ Familia de prueba eliminada');
    
    console.log('\n🎉 Sincronización completada exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
})();
