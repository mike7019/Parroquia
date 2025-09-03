// Script para crear datos de catálogo básicos
import sequelize from './config/sequelize.js';

async function crearDatosCatalogo() {
    try {
        console.log('🔄 Creando datos de catálogo...');
        
        // 1. Tipos de identificación
        console.log('📄 Creando tipos de identificación...');
        const tiposId = [
            ['Cédula de Ciudadanía', 'CC', 'Cédula de Ciudadanía Colombiana'],
            ['Tarjeta de Identidad', 'TI', 'Tarjeta de Identidad para menores'],
            ['Cédula de Extranjería', 'CE', 'Cédula de Extranjería'],
            ['Pasaporte', 'PS', 'Pasaporte']
        ];
        
        for (const [nombre, codigo, descripcion] of tiposId) {
            await sequelize.query(`
                INSERT INTO tipos_identificacion (nombre, codigo, descripcion, created_at, updated_at) 
                VALUES ('${nombre}', '${codigo}', '${descripcion}', NOW(), NOW()) 
                ON CONFLICT (codigo) DO NOTHING
            `);
        }
        console.log('✅ Tipos de identificación creados');
        
        // 2. Sexos
        console.log('👫 Creando sexos...');
        const sexos = ['Masculino', 'Femenino', 'Otro'];
        
        for (const sexo of sexos) {
            await sequelize.query(`
                INSERT INTO sexos (descripcion) 
                VALUES ('${sexo}') 
                ON CONFLICT (descripcion) DO NOTHING
            `);
        }
        console.log('✅ Sexos creados');
        
        // 3. Datos geográficos básicos
        console.log('🏛️ Creando datos geográficos...');
        
        // Departamento Meta
        await sequelize.query(`
            INSERT INTO departamentos (nombre, codigo_dane, created_at, updated_at) 
            VALUES ('Meta', '50', NOW(), NOW()) 
            ON CONFLICT (codigo_dane) DO NOTHING
        `);
        
        // Obtener ID del departamento
        const [deptoResult] = await sequelize.query(`
            SELECT id_departamento FROM departamentos WHERE codigo_dane = '50'
        `);
        
        if (deptoResult.length > 0) {
            const deptoId = deptoResult[0].id_departamento;
            
            // Municipio Villavicencio
            await sequelize.query(`
                INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento, created_at, updated_at) 
                VALUES ('Villavicencio', '50001', ${deptoId}, NOW(), NOW()) 
                ON CONFLICT (codigo_dane) DO NOTHING
            `);
            
            // Obtener ID del municipio
            const [muniResult] = await sequelize.query(`
                SELECT id_municipio FROM municipios WHERE codigo_dane = '50001'
            `);
            
            if (muniResult.length > 0) {
                const muniId = muniResult[0].id_municipio;
                
                // Parroquia San José
                await sequelize.query(`
                    INSERT INTO parroquia (nombre, id_municipio) 
                    VALUES ('Parroquia San José', ${muniId}) 
                    ON CONFLICT (nombre) DO NOTHING
                `);
            }
        }
        console.log('✅ Datos geográficos creados');
        
        // 4. Tipos de vivienda
        console.log('🏠 Creando tipos de vivienda...');
        const tiposVivienda = [
            ['Casa', 'Casa independiente'],
            ['Apartamento', 'Apartamento'],
            ['Finca', 'Finca o casa de campo'],
            ['Otro', 'Otro tipo de vivienda']
        ];
        
        for (const [nombre, descripcion] of tiposVivienda) {
            await sequelize.query(`
                INSERT INTO tipos_vivienda (nombre, descripcion, activo, created_at, updated_at) 
                VALUES ('${nombre}', '${descripcion}', true, NOW(), NOW()) 
                ON CONFLICT (nombre) DO NOTHING
            `);
        }
        console.log('✅ Tipos de vivienda creados');
        
        console.log('');
        console.log('🎉 ¡Datos de catálogo creados exitosamente!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

crearDatosCatalogo();
