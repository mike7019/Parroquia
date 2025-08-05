import sequelize from './config/sequelize.js';

async function populateRoles() {
    try {
        console.log('🔧 Populating roles table...');
        
        // Connect to the database
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        // Insert roles directly using raw SQL
        await sequelize.query(`
            INSERT INTO roles (id, nombre) 
            VALUES 
                ('00000000-0000-0000-0000-000000000001', 'Administrador'),
                ('00000000-0000-0000-0000-000000000002', 'Usuario'),
                ('00000000-0000-0000-0000-000000000003', 'Encuestador')
            ON CONFLICT (id) DO NOTHING
        `);
        
        console.log('✅ Roles populated successfully');
        
        // Verify roles were inserted
        const [roles] = await sequelize.query('SELECT * FROM roles ORDER BY nombre');
        console.log('📋 Available roles:');
        roles.forEach(role => {
            console.log(`   - ${role.nombre} (${role.id})`);
        });
        
    } catch (error) {
        console.error('❌ Error populating roles:', error.message);
        console.error('Error details:', error);
    } finally {
        await sequelize.close();
    }
}

populateRoles();
