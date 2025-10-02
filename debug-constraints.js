import sequelize from './config/sequelize.js';

const checkConstraints = async () => {
  try {
    // Verificar constraints
    const constraints = await sequelize.query(`
      SELECT conname, contype, confrelid::regclass as referenced_table 
      FROM pg_constraint 
      WHERE conrelid = 'sectores'::regclass;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Constraints en tabla sectores:');
    constraints.forEach(c => {
      console.log(` - ${c.conname}: ${c.contype} ${c.referenced_table || ''}`);
    });
    
    // Verificar si existe algún registro
    const count = await sequelize.query(`
      SELECT COUNT(*) as count FROM sectores;
    `, { type: sequelize.QueryTypes.SELECT });
    console.log(`\nRegistros existentes: ${count[0].count}`);
    
    // Verificar secuencia si existe
    try {
      const seq = await sequelize.query(`
        SELECT last_value FROM sectores_id_sector_seq;
      `, { type: sequelize.QueryTypes.SELECT });
      console.log('Secuencia actual:', seq[0]?.last_value);
    } catch (seqError) {
      console.log('No hay secuencia o error:', seqError.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkConstraints();