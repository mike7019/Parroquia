import sequelize from './config/sequelize.js';

async function diagnosticarDepartamentos() {
  try {
    console.log('🔍 DIAGNÓSTICO TABLA DEPARTAMENTOS');
    console.log('=' .repeat(50));
    
    // 1. Verificar estructura
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'departamentos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura actual:');
    console.table(columns);
    
    // 2. Intentar crear un departamento simple
    console.log('\n🧪 Probando creación directa...');
    
    try {
      const [result] = await sequelize.query(`
        INSERT INTO departamentos (nombre, codigo_dane, created_at, updated_at) 
        VALUES ('TEST', '99', NOW(), NOW()) 
        RETURNING *;
      `);
      console.log('✅ Inserción directa exitosa:', result[0]);
      
      // Limpiar
      await sequelize.query(`DELETE FROM departamentos WHERE nombre = 'TEST';`);
      
    } catch (insertError) {
      console.log('❌ Error en inserción directa:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnosticarDepartamentos();
