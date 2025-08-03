import sequelize from './config/sequelize.js';
import User from './src/models/User.js';
import Role from './src/models/Role.js';

async function testUserRegistration() {
    try {
        console.log('🔍 Testing user registration process...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection OK');
        
        // Check if roles exist
        const roles = await Role.findAll();
        console.log('📝 Available roles:', roles.map(r => r.nombre));
        
        // Test user creation with transaction
        const transaction = await sequelize.transaction();
        
        try {
            const testUser = await User.create({
                correo_electronico: 'test-debug@example.com',
                contrasena: 'Password123!',
                primer_nombre: 'Test',
                segundo_nombre: 'Debug',
                primer_apellido: 'User',
                segundo_apellido: 'Testing',
                activo: true,
                email_verificado: false,
                token_verificacion_email: 'test-token-123'
            }, { transaction });
            
            console.log('✅ Test user created:', {
                id: testUser.id,
                email: testUser.correo_electronico,
                name: `${testUser.primer_nombre} ${testUser.primer_apellido}`
            });
            
            // Test role assignment
            const encuestadorRole = await Role.findOne({ 
                where: { nombre: 'Encuestador' },
                transaction 
            });
            
            if (encuestadorRole) {
                await sequelize.query(
                    'INSERT INTO usuarios_roles (id_usuarios, id_roles) VALUES ($1, $2)',
                    {
                        bind: [testUser.id, encuestadorRole.id],
                        transaction
                    }
                );
                console.log('✅ Role assigned successfully');
            } else {
                console.log('❌ Encuestador role not found');
            }
            
            await transaction.commit();
            console.log('✅ Transaction committed successfully');
            
            // Clean up - delete test user
            await User.destroy({ where: { correo_electronico: 'test-debug@example.com' } });
            console.log('🧹 Test user cleaned up');
            
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Transaction error:', error.message);
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testUserRegistration();
