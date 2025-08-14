// Verificación simple y directa del estado final
import sequelize from './config/sequelize.js';

async function verificar() {
  try {
    console.log('🔍 Verificando estado del proyecto...\n');
    
    // Conectar
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');
    
    // Contar tablas
    const [result] = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📊 Total tablas: ${result[0].total}`);
    
    // Verificar veredas
    const [veredas] = await sequelize.query(`
      SELECT COUNT(*) as count FROM veredas
    `);
    console.log(`📋 Registros en veredas: ${veredas[0].count}`);
    
    // Verificar estructura veredas
    const [cols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'veredas' AND column_name IN ('nombre', 'nombre_vereda')
    `);
    
    const tieneNombre = cols.some(c => c.column_name === 'nombre');
    const tieneNombreVereda = cols.some(c => c.column_name === 'nombre_vereda');
    
    console.log(`🔍 Columna 'nombre': ${tieneNombre ? '✅ Existe' : '❌ No existe'}`);
    console.log(`🔍 Columna 'nombre_vereda': ${tieneNombreVereda ? '⚠️ Existe (problemática)' : '✅ No existe (correcto)'}`);
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificar();
