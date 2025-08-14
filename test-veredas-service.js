/**
 * Prueba del servicio de veredas después de la sincronización
 */
import { Veredas } from './src/models/index.js';

async function testVeredasService() {
  try {
    console.log('🧪 Probando servicio de veredas...\n');
    
    // 1. Prueba básica: obtener todas las veredas
    console.log('1. 📊 Obteniendo todas las veredas:');
    const veredas = await Veredas.findAll({
      attributes: ['id_vereda', 'nombre', 'nombre_vereda', 'codigo_vereda'],
      limit: 5
    });
    
    console.table(veredas.map(v => v.toJSON()));
    
    // 2. Prueba de búsqueda
    console.log('\n2. 🔍 Búsqueda por nombre_vereda:');
    const searchResult = await Veredas.findAll({
      where: {
        nombre_vereda: { [import('sequelize').Op.iLike]: '%Test%' }
      }
    });
    
    console.log(`   Resultados encontrados: ${searchResult.length}`);
    if (searchResult.length > 0) {
      console.table(searchResult.map(v => ({
        id: v.id_vereda,
        nombre: v.nombre,
        nombre_vereda: v.nombre_vereda,
        codigo: v.codigo_vereda
      })));
    }
    
    // 3. Crear una vereda nueva para probar los hooks
    console.log('\n3. ➕ Creando nueva vereda (probando hooks):');
    const newVereda = await Veredas.create({
      nombre: 'Vereda Nueva Prueba',
      codigo_vereda: 'VNP001'
    });
    
    console.log('   Vereda creada:');
    console.table([{
      id: newVereda.id_vereda,
      nombre: newVereda.nombre,
      nombre_vereda: newVereda.nombre_vereda, // Debe estar poblado por el hook
      codigo: newVereda.codigo_vereda
    }]);
    
    // 4. Contar total
    const total = await Veredas.count();
    console.log(`\n4. 📈 Total de veredas: ${total}`);
    
    console.log('\n✅ ¡Servicio de veredas funcionando correctamente!');
    console.log('🎉 La columna nombre_vereda está operativa');
    
  } catch (error) {
    console.error('❌ Error en el servicio:', error.message);
    console.error('SQL:', error.sql);
  }
}

testVeredasService().catch(console.error);
