import { runGeografiaSeeders } from './geografiaOptimizada.js';
import sequelize from '../../config/sequelize.js';

async function main() {
  try {
    console.log('🚀 Iniciando proceso de seeding completo de geografía...');
    
    // Autenticar conexión de base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Ejecutar todos los seeders
    const resultados = await runGeografiaSeeders();
    
    // Mostrar resumen final
    console.log('\n🎯 PROCESO COMPLETADO');
    console.log('================================');
    
    if (resultados.departamentos?.success) {
      console.log(`✅ Departamentos: ${resultados.departamentos.inserted} registros`);
    } else {
      console.log(`❌ Departamentos: ${resultados.departamentos?.message || 'Error'}`);
    }
    
    if (resultados.municipios?.success) {
      console.log(`✅ Municipios: ${resultados.municipios.inserted} registros`);
    } else {
      console.log(`❌ Municipios: ${resultados.municipios?.message || 'Error'}`);
    }
    
    if (resultados.datosBasicos?.success) {
      console.log(`✅ Datos básicos: Parroquias, sectores y veredas creadas`);
    } else {
      console.log(`❌ Datos básicos: ${resultados.datosBasicos?.message || 'Error'}`);
    }

    console.log('\n🎊 ¡Listo para crear encuestas con datos geográficos completos!');
    
  } catch (error) {
    console.error('💥 Error en proceso de seeding:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a base de datos cerrada');
  }
}

// Ejecutar proceso
main().catch(console.error);
