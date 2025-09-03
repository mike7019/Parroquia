import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';
import bcrypt from 'bcrypt';

async function recreateAdminUser() {
    try {
        console.log('🔄 Recreando usuario admin con credenciales exactas...');
        
        // Cargar modelos
        await loadAllModels();
        const { Usuario, Role } = sequelize.models;
        
        const email = 'admin@parroquia.com';
        const password = 'Admin123!';
        
        console.log('📧 Email:', email);
        console.log('🔐 Password:', password);
        
        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('🔒 Hash generado:', hashedPassword);
        
        // Eliminar usuario existente si existe
        await Usuario.destroy({
            where: { correo_electronico: email }
        });
        console.log('🗑️ Usuario existente eliminado');
        
        // Crear el usuario
        const userData = {
            correo_electronico: email,
            contrasena: hashedPassword,
            primer_nombre: 'Admin',
            primer_apellido: 'Sistema',
            activo: true,
            email_verificado: true,
            intentos_fallidos: 0,
            bloqueado_hasta: null
        };
        
        const usuario = await Usuario.create(userData);
        console.log('✅ Usuario creado con ID:', usuario.id);
        
        // Verificar que la contraseña funciona
        const isValid = await bcrypt.compare(password, hashedPassword);
        console.log('🔍 Verificación de contraseña:', isValid);
        
        // Crear rol admin si no existe
        let adminRole = await Role.findOne({ where: { nombre: 'admin' } });
        if (!adminRole) {
            adminRole = await Role.create({ nombre: 'admin' });
            console.log('✅ Rol admin creado');
        } else {
            console.log('✅ Rol admin ya existe');
        }
        
        console.log('\n✅ Usuario admin recreado exitosamente');
        console.log('📧 Email: admin@parroquia.com');
        console.log('🔐 Password: Admin123!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

recreateAdminUser();
