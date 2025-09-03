import bcrypt from 'bcryptjs';
import { Usuario, Role } from './src/models/index.js';
import sequelize from './config/sequelize.js';

async function crearUsuarioExacto() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a BD establecida');

        // Crear o buscar rol admin
        let adminRole = await Role.findOne({ where: { nombre: 'admin' } });
        if (!adminRole) {
            adminRole = await Role.create({
                nombre: 'admin'
            });
            console.log('✅ Rol admin creado');
        }

        // Eliminar usuario existente si existe
        await Usuario.destroy({
            where: { correo_electronico: 'admin@parroquia.com' }
        });
        console.log('🗑️ Usuario existente eliminado');

        // Crear el usuario exacto (el modelo se encarga del hash automáticamente)
        console.log('🔐 Creando usuario con contraseña: Admin123!');

        // Crear el usuario exacto
        const newUser = await Usuario.create({
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!',
            primer_nombre: 'Administrador',
            segundo_nombre: null,
            primer_apellido: 'Sistema',
            segundo_apellido: null,
            numero_documento: 'ADMIN001',
            telefono: '3001234567',
            activo: true,
            email_verificado: true,
            intentos_fallidos: 0
        });

        console.log('✅ Usuario admin@parroquia.com creado con ID:', newUser.id);

        // Verificar que la contraseña funciona
        const passwordMatch = await bcrypt.compare('Admin123!', newUser.contrasena);
        console.log('🔍 Verificación de contraseña:', passwordMatch ? '✅ CORRECTA' : '❌ INCORRECTA');

        // Mostrar información del usuario
        console.log('\n📋 Usuario creado:');
        console.log('  Email:', newUser.correo_electronico);
        console.log('  Nombre:', newUser.primer_nombre, newUser.primer_apellido);
        console.log('  Activo:', newUser.activo);
        console.log('  Email verificado:', newUser.email_verificado);
        console.log('  Contraseña original: Admin123!');

        console.log('\n🎯 Usuario listo para login!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

crearUsuarioExacto();
