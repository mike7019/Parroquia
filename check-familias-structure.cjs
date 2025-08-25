// Script para ver la estructura real de la tabla familias
const { Sequelize } = require('sequelize');
const path = require('path');

async function checkFamiliasStructure() {
    try {
        const configPath = path.join(__dirname, 'config', 'config.cjs');
        const config = require(configPath);
        const dbConfig = config.development;
        
        const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            logging: false
        });

        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos\n');

        const [columns] = await sequelize.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'familias' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('📋 ESTRUCTURA DE LA TABLA FAMILIAS:');
        console.log('=====================================');
        columns.forEach(col => {
            console.log(`• ${col.column_name}: ${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default || 'none'}`);
        });

        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkFamiliasStructure();
