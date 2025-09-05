/**
 * Script para recrear usuario admin con contraseña verificada
 */

import bcrypt from 'bcrypt';
import { Usuario } from './src/models/index.js';
import sequelize from './config/sequelize.js';

async function recreateAdminUser() {
    try {
        console.log('🔗 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');

        // Eliminar usuarios existentes admin
        console.log('🗑️ Eliminando usuarios admin existentes...');
        await Usuario.destroy({
            where: {
                correo_electronico: {
                    [sequelize.Sequelize.Op.in]: ['admin@admin.com', 'admin@parroquia.com']
                }
            },
            force: true // Eliminar completamente
        });

        console.log('✅ Usuarios admin anteriores eliminados');

        // Crear nuevo usuario admin sin hooks (hashear manualmente)
        console.log('👤 Creando nuevo usuario admin...');
        
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        console.log(`🔐 Contraseña plana: ${plainPassword}`);
        console.log(`🔒 Contraseña hasheada: ${hashedPassword.substring(0, 20)}...`);

        const admin = await Usuario.create({
            primer_nombre: 'Admin',
            primer_apellido: 'Sistema',
            correo_electronico: 'admin@admin.com',
            contrasena: hashedPassword, // Usar contraseña ya hasheada para evitar double-hash
            activo: true,
            email_verificado: true,
            intentos_fallidos: 0
        }, {
            hooks: false // Evitar que se hashee de nuevo
        });

        console.log('✅ Usuario admin creado');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.correo_electronico}`);

        // Verificar inmediatamente que la contraseña funciona
        console.log('🧪 Verificando contraseña...');
        const passwordCheck = await admin.checkPassword(plainPassword);
        console.log(`✅ Verificación de contraseña: ${passwordCheck}`);

        if (passwordCheck) {
            console.log('🎉 ¡USUARIO ADMIN CREADO EXITOSAMENTE!');
            console.log('📋 Credenciales de acceso:');
            console.log(`   Email: admin@admin.com`);
            console.log(`   Contraseña: admin123`);
        } else {
            console.log('❌ Error: La contraseña no funciona correctamente');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

recreateAdminUser();
