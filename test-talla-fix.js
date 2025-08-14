import sequelize from './config/sequelize.js';
import Talla from './src/models/catalog/Talla.js';

async function testTallaSync() {
  try {
    console.log('🔄 Iniciando sincronización del modelo Talla...');
    
    // Primero intentar con alter: true
    console.log('📝 Intentando sync con alter: true...');
    await Talla.sync({ alter: true });
    console.log('✅ Sincronización con ALTER exitosa');
    
    // Verificar que el modelo funciona
    console.log('🔍 Verificando funcionalidad del modelo...');
    const count = await Talla.count();
    console.log(`📊 Total de registros en tallas: ${count}`);
    
    // Mostrar estructura actual
    console.log('📋 Obteniendo estructura actual...');
    const description = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tallas' 
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📊 Estructura de la tabla tallas:');
    description.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ Modelo Talla sincronizado correctamente');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    console.error('SQL problema:', error.sql);
    
    if (error.message.includes('USING') || error.message.includes('ENUM')) {
      console.log('\n🔧 Detectado problema con ENUM. Intentando solución...');
      
      try {
        // Intentar eliminar y recrear la tabla
        console.log('🗑️ Intentando recrear tabla...');
        await Talla.drop();
        await Talla.sync();
        console.log('✅ Tabla recreada exitosamente');
      } catch (recreateError) {
        console.error('❌ Error al recrear tabla:', recreateError.message);
      }
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testTallaSync().catch(console.error);
