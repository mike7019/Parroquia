import sequelize from './config/sequelize.js';
import User from './src/models/User.js';

async function testUserModel() {
    try {
        console.log('🔍 Testing user model...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection OK');
        
        // Test query with explicit attributes
        const user = await User.findOne({
            where: { correo_electronico: 'admin@parroquia.com' },
            attributes: ['id', 'correo_electronico', 'primer_nombre', 'primer_apellido', 'activo']
        });
        
        if (user) {
            console.log('✅ User found:', user.toJSON());
        } else {
            console.log('❌ User not found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

testUserModel();
