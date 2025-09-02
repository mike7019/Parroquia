import sequelize from './config/sequelize.js';
import { 
  Departamentos, 
  Municipios, 
  Parroquia, 
  Sector, 
  Veredas,
  Sexo,
  TipoIdentificacion,
  Familias,
  Persona
} from './src/models/index.js';

/**
 * Test de sincronización local antes del despliegue
 */
async function testSyncLocal() {
  try {
    console.log('🧪 Iniciando test de sincronización local...\n');
    
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos OK\n');
    
    // 2. Sincronizar en orden correcto (sin force para no borrar datos)
    console.log('🔄 Sincronizando modelos...');
    
    await Departamentos.sync({ alter: false });
    console.log('  ✅ Departamentos');
    
    await Sexo.sync({ alter: false });
    console.log('  ✅ Sexos');
    
    await TipoIdentificacion.sync({ alter: false });
    console.log('  ✅ TipoIdentificacion');
    
    await Municipios.sync({ alter: false });
    console.log('  ✅ Municipios');
    
    await Parroquia.sync({ alter: false });
    console.log('  ✅ Parroquia (singular)');
    
    await Sector.sync({ alter: false });
    console.log('  ✅ Sector');
    
    await Veredas.sync({ alter: false });
    console.log('  ✅ Veredas');
    
    await Familias.sync({ alter: false });
    console.log('  ✅ Familias');
    
    await Persona.sync({ alter: false });
    console.log('  ✅ Persona (con referencia corregida a parroquia)');
    
    console.log('\n🎉 Todos los modelos sincronizados correctamente!');
    console.log('✅ El fix está listo para desplegar al servidor');
    
  } catch (error) {
    console.error('\n❌ Error en sincronización:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar test
testSyncLocal()
  .then(() => {
    console.log('\n🚀 Test completado - Listo para git push');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test falló:', error.message);
    process.exit(1);
  });
