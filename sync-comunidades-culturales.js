// Script para sincronizar la tabla comunidades_culturales
import sequelize from './config/sequelize.js';
import './src/models/main/ComunidadCultural.cjs';

async function syncComunidadesCulturales() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente');

        console.log('📦 Cargando modelo ComunidadCultural...');
        const ComunidadCultural = sequelize.models.ComunidadCultural;
        
        if (!ComunidadCultural) {
            console.error('❌ Modelo ComunidadCultural no encontrado');
            process.exit(1);
        }

        console.log('🔧 Sincronizando tabla comunidades_culturales...');
        await ComunidadCultural.sync({ force: false });
        console.log('✅ Tabla comunidades_culturales sincronizada exitosamente');

        // Verificar si ya existen datos
        const count = await ComunidadCultural.count();
        console.log(`📊 Registros existentes: ${count}`);

        // Si no hay datos, insertar algunos de muestra
        if (count === 0) {
            console.log('📝 Insertando datos de muestra...');
            
            const datosEjemplo = [
                { nombre: 'Afrodescendiente', descripcion: 'Comunidad de personas afrodescendientes', activo: true },
                { nombre: 'Indígena', descripcion: 'Comunidades indígenas ancestrales', activo: true },
                { nombre: 'Mestiza', descripcion: 'Comunidad mestiza tradicional', activo: true },
                { nombre: 'Raizal', descripcion: 'Comunidad raizal del archipiélago', activo: true },
                { nombre: 'Palenquera', descripcion: 'Comunidad palenquera', activo: true },
                { nombre: 'ROM (Gitana)', descripcion: 'Comunidad ROM o gitana', activo: true },
                { nombre: 'Campesina', descripcion: 'Comunidad campesina rural', activo: true },
                { nombre: 'Urbana', descripcion: 'Comunidad urbana', activo: true },
                { nombre: 'Ribereña', descripcion: 'Comunidad ribereña', activo: true },
                { nombre: 'Montañesa', descripcion: 'Comunidad de las montañas', activo: true },
                { nombre: 'Costera', descripcion: 'Comunidad de las costas', activo: true },
                { nombre: 'Llanera', descripcion: 'Comunidad de los llanos', activo: true },
                { nombre: 'Amazónica', descripcion: 'Comunidad de la región amazónica', activo: true },
                { nombre: 'Andina', descripcion: 'Comunidad de la región andina', activo: true },
                { nombre: 'Pacífica', descripcion: 'Comunidad de la región pacífica', activo: true },
                { nombre: 'Caribeña', descripcion: 'Comunidad de la región caribeña', activo: true },
                { nombre: 'Orinoquia', descripcion: 'Comunidad de la Orinoquia', activo: true },
                { nombre: 'Isleña', descripcion: 'Comunidad de las islas', activo: true },
                { nombre: 'Fronteriza', descripcion: 'Comunidad de zonas fronterizas', activo: true },
                { nombre: 'Minera', descripcion: 'Comunidad minera tradicional', activo: true }
            ];

            await ComunidadCultural.bulkCreate(datosEjemplo);
            console.log(`✅ ${datosEjemplo.length} registros insertados exitosamente`);
        }

        // Consulta de verificación
        const comunidades = await ComunidadCultural.findAll({
            order: [['nombre', 'ASC']],
            limit: 5
        });

        console.log('📋 Primeras 5 comunidades culturales:');
        comunidades.forEach(c => {
            console.log(`  - ID: ${c.id_comunidad_cultural}, Nombre: ${c.nombre}`);
        });

        console.log('✅ Sincronización completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante la sincronización:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

syncComunidadesCulturales();
