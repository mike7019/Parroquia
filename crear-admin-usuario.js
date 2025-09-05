#!/usr/bin/env node

import { config } from 'dotenv';
import bcrypt from 'bcrypt';

// Cargar variables de entorno
config();

// Importar conexión a la base de datos
import sequelize from './config/sequelize.js';

// Importar modelos
import Usuario from './src/models/Usuario.js';
import Role from './src/models/Role.js';
import UsuarioRole from './src/models/UsuarioRole.js';

const crearUsuarioAdmin = async () => {
  try {
    console.log('🚀 CREANDO USUARIO ADMINISTRADOR');
    console.log('═══════════════════════════════════════════════════════');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si ya existe un usuario con este correo
    const usuarioExistente = await Usuario.findOne({
      where: { correo_electronico: 'admin@parroquia.com' }
    });

    if (usuarioExistente) {
      console.log('ℹ️ El usuario administrador ya existe');
      console.log(`📧 Correo: ${usuarioExistente.correo_electronico}`);
      console.log(`👤 Nombre: ${usuarioExistente.primer_nombre} ${usuarioExistente.primer_apellido}`);
      return;
    }

    // Crear o encontrar el rol de administrador
    let [rolAdmin] = await Role.findOrCreate({
      where: { nombre: 'admin' },
      defaults: {
        nombre: 'admin',
        descripcion: 'Administrador del sistema'
      }
    });

    console.log(`✅ Rol admin obtenido: ID ${rolAdmin.id}`);

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Crear usuario administrador
    const nuevoAdmin = await Usuario.create({
      correo_electronico: 'admin@parroquia.com',
      contrasena: hashedPassword,
      primer_nombre: 'Administrador',
      segundo_nombre: 'Sistema',
      primer_apellido: 'Parroquia',
      segundo_apellido: 'Admin',
      activo: true
    });

    console.log(`✅ Usuario administrador creado: ID ${nuevoAdmin.id}`);

    // Asociar el usuario con el rol de admin
    await UsuarioRole.create({
      id_usuarios: nuevoAdmin.id,
      id_roles: rolAdmin.id
    });

    console.log('✅ Rol de administrador asignado al usuario');

    console.log('\n🎉 USUARIO ADMINISTRADOR CONFIGURADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 Correo: admin@parroquia.com');
    console.log('🔑 Contraseña: admin123');
    console.log('👤 Rol: Administrador');
    console.log('\n⚠️ IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('💥 ERROR al crear usuario administrador:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
};

// Ejecutar la función
crearUsuarioAdmin();
