import sequelize from './config/sequelize.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Datos del administrador
    const adminData = {
      id: uuidv4(),
      correo_electronico: 'admin@parroquia.com',
      contrasena: await bcrypt.hash('admin123', 12),
      primer_nombre: 'Admin',
      segundo_nombre: null,
      primer_apellido: 'Sistema',
      segundo_apellido: null,
      activo: true
    };

    // Verificar si ya existe
    const [existing] = await sequelize.query(`
      SELECT * FROM usuarios WHERE correo_electronico = :email
    `, {
      replacements: { email: adminData.correo_electronico },
      type: sequelize.QueryTypes.SELECT
    });

    if (existing) {
      console.log('⚠️  Usuario admin ya existe, actualizando contraseña...');
      await sequelize.query(`
        UPDATE usuarios 
        SET contrasena = :password, activo = true
        WHERE correo_electronico = :email
      `, {
        replacements: { 
          password: adminData.contrasena, 
          email: adminData.correo_electronico 
        }
      });
      console.log('✅ Contraseña actualizada');
    } else {
      // Crear nuevo usuario
      await sequelize.query(`
        INSERT INTO usuarios (id, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, activo)
        VALUES (:id, :email, :password, :firstName, :secondName, :lastName, :secondLastName, :active)
      `, {
        replacements: {
          id: adminData.id,
          email: adminData.correo_electronico,
          password: adminData.contrasena,
          firstName: adminData.primer_nombre,
          secondName: adminData.segundo_nombre,
          lastName: adminData.primer_apellido,
          secondLastName: adminData.segundo_apellido,
          active: adminData.activo
        }
      });
      console.log('✅ Usuario administrador creado exitosamente');
    }

    console.log(`\n📋 Credenciales:
    📧 Email: admin@parroquia.com
    🔐 Password: admin123`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();
