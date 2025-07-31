import bcrypt from 'bcrypt';
import sequelize from './config/sequelize.js';

async function updateAdminPassword() {
    try {
        // Generar hash para admin123
        const hash = await bcrypt.hash('admin123', 10);
        console.log('Hash generado:', hash);
        
        // Actualizar en la base de datos
        const result = await sequelize.query(
            'UPDATE usuarios SET contrasena = :hash WHERE correo_electronico = :email',
            {
                replacements: { hash, email: 'admin@parroquia.com' },
                type: sequelize.QueryTypes.UPDATE
            }
        );
        
        console.log('Usuario actualizado:', result);
        
        // Verificar la actualización
        const [user] = await sequelize.query(
            'SELECT correo_electronico, contrasena FROM usuarios WHERE correo_electronico = :email',
            {
                replacements: { email: 'admin@parroquia.com' },
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        console.log('Usuario verificado:', user);
        
        // Probar la comparación
        const isValid = await bcrypt.compare('admin123', user.contrasena);
        console.log('Comparación de contraseña:', isValid);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

updateAdminPassword();
