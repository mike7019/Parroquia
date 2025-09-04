import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function testEncuestaTransaction() {
  console.log('🧪 PROBANDO TRANSACCIÓN DE ENCUESTA');
  console.log('═══════════════════════════════════════');
  console.log('');

  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    dialect: 'postgres', 
    logging: false
  });

  try {
    await sequelize.authenticate();
    
    const transaction = await sequelize.transaction();
    
    try {
      // Simular el flujo de una encuesta
      console.log('1️⃣ Creando familia de prueba...');
      
      const [familia] = await sequelize.query(
        `INSERT INTO familias (apellido_familiar, sector, created_at, updated_at) 
         VALUES ('Familia Test', 'Centro', NOW(), NOW()) RETURNING id_familia`,
        { transaction }
      );
      
      const familiaId = familia[0].id_familia;
      console.log(`   ✅ Familia creada con ID: ${familiaId}`);
      
      console.log('2️⃣ Registrando sistema de acueducto...');
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('   ✅ Sistema acueducto registrado');
      
      console.log('3️⃣ Registrando aguas residuales...');
      await sequelize.query(
        'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('   ✅ Aguas residuales registradas');
      
      console.log('4️⃣ Registrando tipo de vivienda...');
      await sequelize.query(
        'INSERT INTO familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('   ✅ Tipo vivienda registrado');
      
      // Si llegamos aquí, hacer commit
      await transaction.commit();
      console.log('\n🎉 ¡TRANSACCIÓN EXITOSA!');
      console.log('✅ Todos los registros fueron creados correctamente');
      console.log('✅ El error de transacción está RESUELTO');
      
      // Limpiar datos de prueba
      await sequelize.query(`DELETE FROM familias WHERE id_familia = ${familiaId}`);
      console.log('🧹 Datos de prueba limpiados');
      
    } catch (error) {
      await transaction.rollback();
      console.log('\n❌ ERROR EN TRANSACCIÓN:');
      console.log(`   Mensaje: ${error.message}`);
      console.log(`   Tipo: ${error.name}`);
      throw error;
    }
    
    await sequelize.close();
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch(e) { 
    console.error('\n💥 ERROR CRÍTICO:', e.message); 
    process.exit(1);
  }
}

testEncuestaTransaction();
