import { sequelize } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function crearUsuarioAdmin() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Obtener modelos
        const { Usuario, Role, UsuarioRole } = sequelize.models;

        // Datos del usuario
        const datosUsuario = {
            correo_electronico: "admin@parroquia.com",
            contrasena: "Admin123!"
        };

        console.log('🔍 Verificando si el usuario ya existe...');
        const usuarioExistente = await Usuario.findOne({
            where: { correo_electronico: datosUsuario.correo_electronico }
        });

        if (usuarioExistente) {
            console.log('⚠️ El usuario ya existe. Actualizando contraseña...');
            
            // Encriptar nueva contraseña
            const hashedPassword = await bcrypt.hash(datosUsuario.contrasena, 12);
            
            // Actualizar contraseña
            await usuarioExistente.update({
                contrasena: hashedPassword,
                activo: true,
                email_verificado: true
            });
            
            console.log('✅ Contraseña actualizada para:', datosUsuario.correo_electronico);
        } else {
            console.log('👤 Creando nuevo usuario administrador...');
            
            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(datosUsuario.contrasena, 12);
            
            // Crear usuario
            const nuevoUsuario = await Usuario.create({
                id: uuidv4(),
                correo_electronico: datosUsuario.correo_electronico,
                contrasena: hashedPassword,
                primer_nombre: 'Administrador',
                segundo_nombre: 'Sistema',
                primer_apellido: 'Parroquia',
                segundo_apellido: 'Admin',
                numero_documento: '12345678',
                telefono: '3001234567',
                activo: true,
                email_verificado: true,
                intentos_fallidos: 0
            });
            
            console.log('✅ Usuario creado:', nuevoUsuario.correo_electronico);
            
            // Crear rol de administrador si no existe
            console.log('🔑 Verificando rol de administrador...');
            let rolAdmin = await Role.findOne({ where: { nombre: 'admin' } });
            
            if (!rolAdmin) {
                console.log('🔑 Creando rol de administrador...');
                rolAdmin = await Role.create({
                    id: uuidv4(),
                    nombre: 'admin'
                });
                console.log('✅ Rol admin creado');
            }
            
            // Asignar rol al usuario
            console.log('🔗 Asignando rol de administrador al usuario...');
            await UsuarioRole.create({
                id_usuarios: nuevoUsuario.id,
                id_roles: rolAdmin.id
            });
            
            console.log('✅ Rol asignado correctamente');
        }

        console.log('\n🎉 USUARIO ADMINISTRADOR CONFIGURADO:');
        console.log(`   📧 Email: ${datosUsuario.correo_electronico}`);
        console.log(`   🔑 Contraseña: ${datosUsuario.contrasena}`);
        console.log(`   👤 Rol: Administrador`);
        console.log(`   ✅ Estado: Activo y verificado`);

        await sequelize.close();
        console.log('\n✅ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        if (sequelize) {
            await sequelize.close();
        }
        process.exit(1);
    }
}

// Ejecutar función
crearUsuarioAdmin();
