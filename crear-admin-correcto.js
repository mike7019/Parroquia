import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

async function createCorrectAdminUser() {
    try {
        console.log('🔄 Creando usuario admin correctamente...');
        
        // Cargar modelos
        await loadAllModels();
        const { Usuario, Role } = sequelize.models;
        
        const email = 'admin@parroquia.com';
        const password = 'Admin123!'; // Contraseña en texto plano - el hook la hasheará
        
        console.log('📧 Email:', email);
        console.log('🔐 Password:', password);
        
        // Eliminar usuario existente si existe
        await Usuario.destroy({
            where: { correo_electronico: email }
        });
        console.log('🗑️ Usuario existente eliminado');
        
        // Crear el usuario (la contraseña se hasheará automáticamente por el hook beforeCreate)
        const userData = {
            correo_electronico: email,
            contrasena: password, // Texto plano - será hasheado por el hook
            primer_nombre: 'Admin',
            primer_apellido: 'Sistema',
            activo: true,
            email_verificado: true,
            intentos_fallidos: 0,
            bloqueado_hasta: null
        };
        
        const usuario = await Usuario.create(userData);
        console.log('✅ Usuario creado con ID:', usuario.id);
        
        // Verificar que la contraseña funciona usando el método del modelo
        const isValid = await usuario.checkPassword(password);
        console.log('🔍 Verificación de contraseña con método del modelo:', isValid);
        
        // Crear rol admin si no existe
        let adminRole = await Role.findOne({ where: { nombre: 'admin' } });
        if (!adminRole) {
            adminRole = await Role.create({ nombre: 'admin' });
            console.log('✅ Rol admin creado');
        } else {
            console.log('✅ Rol admin ya existe');
        }
        
        // Asociar usuario con rol admin
        try {
            await usuario.addRole(adminRole);
            console.log('✅ Rol admin asignado al usuario');
        } catch (roleError) {
            console.log('ℹ️ Rol ya estaba asignado o error menor:', roleError.message);
        }
        
        console.log('\n✅ Usuario admin creado correctamente');
        console.log('📧 Email: admin@parroquia.com');
        console.log('🔐 Password: Admin123!');
        console.log('🎯 Listo para usar en la API');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

createCorrectAdminUser();
