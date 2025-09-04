import bcrypt from 'bcrypt';
import { Usuario, Role, UsuarioRole } from '../src/models/index.js';
import sequelize from '../config/sequelize.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('👤 CREAR USUARIO ADMINISTRADOR');
    console.log('================================\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await Usuario.findOne({
      where: {
        correo_electronico: 'admin@parroquia.com'
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario admin con email admin@parroquia.com');
      const overwrite = await question('¿Desea sobrescribirlo? (s/N): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        return;
      }
      await existingAdmin.destroy();
      console.log('🗑️  Usuario admin anterior eliminado');
    }

    // Solicitar datos del usuario
    console.log('📝 Ingrese los datos del administrador:\n');
    
    const primer_nombre = await question('Primer nombre: ');
    const segundo_nombre = await question('Segundo nombre (opcional): ');
    const primer_apellido = await question('Primer apellido: ');
    const segundo_apellido = await question('Segundo apellido (opcional): ');
    const correo_electronico = await question('Correo electrónico [admin@parroquia.com]: ') || 'admin@parroquia.com';
    const numero_documento = await question('Número de documento: ');
    const telefono = await question('Teléfono (opcional): ');
    
    let contrasena;
    while (!contrasena || contrasena.length < 6) {
      contrasena = await question('Contraseña (mínimo 6 caracteres): ');
      if (!contrasena || contrasena.length < 6) {
        console.log('❌ La contraseña debe tener al menos 6 caracteres');
      }
    }

    // Verificar o crear rol de Administrador
    console.log('\n🔐 Verificando rol de Administrador...');
    let adminRole = await Role.findOne({ where: { nombre: 'Administrador' } });
    
    if (!adminRole) {
      console.log('📝 Creando rol de Administrador...');
      adminRole = await Role.create({
        nombre: 'Administrador',
        descripcion: 'Administrador del sistema con todos los permisos'
      });
      console.log('✅ Rol de Administrador creado');
    } else {
      console.log('✅ Rol de Administrador encontrado');
    }

    // Encriptar contraseña
    console.log('🔒 Encriptando contraseña...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Crear usuario
    console.log('👤 Creando usuario administrador...');
    const adminUser = await Usuario.create({
      primer_nombre,
      segundo_nombre: segundo_nombre || null,
      primer_apellido,
      segundo_apellido: segundo_apellido || null,
      correo_electronico,
      contrasena: hashedPassword,
      numero_documento,
      telefono: telefono || null,
      activo: true,
      email_verificado: true,
      tipo_usuario: 'Administrador'
    });

    // Asignar rol
    console.log('🔗 Asignando rol de Administrador...');
    await UsuarioRole.create({
      id_usuarios: adminUser.id,
      id_roles: adminRole.id
    });

    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('📋 Datos del usuario:');
    console.log(`   Nombre: ${primer_nombre} ${segundo_nombre || ''} ${primer_apellido} ${segundo_apellido || ''}`);
    console.log(`   Email: ${correo_electronico}`);
    console.log(`   Documento: ${numero_documento}`);
    console.log(`   Teléfono: ${telefono || 'No especificado'}`);
    console.log(`   Rol: Administrador`);
    console.log(`   Estado: Activo`);
    console.log(`   Email verificado: Sí`);

    console.log('\n✅ Puede usar estas credenciales para hacer login en el sistema');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    throw error;
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Ejecutar creación
createAdminUser()
  .then(() => {
    console.log('\n🎯 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error.message);
    process.exit(1);
  });
