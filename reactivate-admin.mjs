import sequelize from './config/sequelize.js';

async function reactivateAdminAccount() {
  try {
    console.log('🔧 Buscando y reactivando cuenta de administrador...');
    
    // Buscar la cuenta admin
    const [users] = await sequelize.query(`
      SELECT id, correo_electronico, primer_nombre, activo, email_verificado
      FROM usuarios 
      WHERE correo_electronico = 'admin@parroquia.com'
    `);
    
    if (users.length === 0) {
      console.log('❌ No se encontró la cuenta admin@parroquia.com');
      process.exit(1);
    }
    
    const admin = users[0];
    console.log('📋 Estado actual del administrador:');
    console.log(`   - Email: ${admin.correo_electronico}`);
    console.log(`   - Nombre: ${admin.primer_nombre}`);
    console.log(`   - Activo: ${admin.activo}`);
    console.log(`   - Email verificado: ${admin.email_verificado}`);
    
    // Reactivar la cuenta
    await sequelize.query(`
      UPDATE usuarios 
      SET activo = true, email_verificado = true
      WHERE correo_electronico = 'admin@parroquia.com'
    `);
    
    console.log('✅ Cuenta de administrador reactivada exitosamente');
    console.log('🎯 Ahora puedes hacer login con: admin@parroquia.com / Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

reactivateAdminAccount();
