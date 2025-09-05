import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function verificarTablas() {
  try {
    await sequelize.authenticate();
    console.log('🔍 Verificando estructura de tablas...\n');
    
    // Verificar tabla familias
    const familias = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 TABLA FAMILIAS:');
    familias.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`));
    
    // Verificar tabla personas
    const personas = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📋 TABLA PERSONAS:');
    personas.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`));
    
    // Verificar tabla sexos
    const sexos = await sequelize.query('SELECT * FROM sexos', { type: QueryTypes.SELECT });
    console.log('\n📋 TABLA SEXOS (datos):');
    sexos.forEach(s => console.log(`  - ID: ${s.id_sexo}, Descripción: ${s.descripcion}`));
    
    // Verificar tabla tipos_identificacion
    const tiposId = await sequelize.query('SELECT * FROM tipos_identificacion', { type: QueryTypes.SELECT });
    console.log('\n📋 TABLA TIPOS_IDENTIFICACION (datos):');
    tiposId.forEach(t => console.log(`  - ID: ${t.id_tipo_identificacion}, Nombre: ${t.nombre}, Código: ${t.codigo}`));
    
    // Verificar tablas de relación
    console.log('\n📋 TABLAS DE RELACIÓN:');
    
    const tablasRelacion = [
      'familia_disposicion_basura',
      'familia_sistema_acueducto', 
      'familia_sistema_aguas_residuales',
      'tipos_disposicion_basura',
      'sistemas_acueducto',
      'tipos_aguas_residuales'
    ];
    
    for (const tabla of tablasRelacion) {
      try {
        const estructura = await sequelize.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${tabla}' 
          ORDER BY ordinal_position
        `, { type: QueryTypes.SELECT });
        
        if (estructura.length > 0) {
          console.log(`\n  🔗 ${tabla}:`);
          estructura.forEach(col => console.log(`    - ${col.column_name}: ${col.data_type}`));
        } else {
          console.log(`\n  ❌ ${tabla}: No existe`);
        }
      } catch (error) {
        console.log(`\n  ❌ ${tabla}: Error - ${error.message}`);
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarTablas();
