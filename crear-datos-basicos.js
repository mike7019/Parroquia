// Crear usuario administrador y datos básicos
import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const { models } = sequelize;

async function crearDatosBasicos() {
    try {
        console.log('🔄 Iniciando creación de datos básicos...');
        
        // Cargar modelos
        await loadAllModels();
        
        // 1. Crear rol administrador
        console.log('👥 Creando rol administrador...');
        const [rolAdmin] = await models.Role.findOrCreate({
            where: { nombre: 'admin' },
            defaults: {
                id: uuidv4(),
                nombre: 'admin'
            }
        });
        console.log(`✅ Rol admin creado: ${rolAdmin.id}`);
        
        // 2. Crear usuario administrador
        console.log('👤 Creando usuario administrador...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const [usuarioAdmin] = await models.Usuario.findOrCreate({
            where: { correo_electronico: 'admin@parroquia.com' },
            defaults: {
                id: uuidv4(),
                correo_electronico: 'admin@parroquia.com',
                contrasena: hashedPassword,
                primer_nombre: 'Administrador',
                primer_apellido: 'Sistema',
                numero_documento: '12345678',
                telefono: '3001234567',
                activo: true,
                email_verificado: true
            }
        });
        console.log(`✅ Usuario admin creado: ${usuarioAdmin.id}`);
        
        // 3. Asignar rol al usuario
        console.log('🔗 Asignando rol al usuario...');
        await models.UsuarioRole.findOrCreate({
            where: {
                id_usuarios: usuarioAdmin.id,
                id_roles: rolAdmin.id
            }
        });
        console.log('✅ Rol asignado al usuario');
        
        // 4. Crear tipos de identificación básicos
        console.log('📄 Creando tipos de identificación...');
        const tiposId = [
            { nombre: 'Cédula de Ciudadanía', codigo: 'CC', descripcion: 'Cédula de Ciudadanía Colombiana' },
            { nombre: 'Tarjeta de Identidad', codigo: 'TI', descripcion: 'Tarjeta de Identidad para menores' },
            { nombre: 'Cédula de Extranjería', codigo: 'CE', descripcion: 'Cédula de Extranjería' },
            { nombre: 'Pasaporte', codigo: 'PS', descripcion: 'Pasaporte' }
        ];
        
        for (const tipo of tiposId) {
            await models.TipoIdentificacion.findOrCreate({
                where: { codigo: tipo.codigo },
                defaults: tipo
            });
        }
        console.log('✅ Tipos de identificación creados');
        
        // 5. Crear sexos
        console.log('👫 Creando sexos...');
        const sexos = [
            { descripcion: 'Masculino' },
            { descripcion: 'Femenino' },
            { descripcion: 'Otro' }
        ];
        
        for (const sexo of sexos) {
            await models.Sexo.findOrCreate({
                where: { descripcion: sexo.descripcion },
                defaults: sexo
            });
        }
        console.log('✅ Sexos creados');
        
        // 6. Crear un departamento básico (ejemplo)
        console.log('🏛️ Creando datos geográficos básicos...');
        const [departamento] = await models.Departamentos.findOrCreate({
            where: { codigo_dane: '50' },
            defaults: {
                nombre: 'Meta',
                codigo_dane: '50'
            }
        });
        
        // 7. Crear un municipio básico
        const [municipio] = await models.Municipios.findOrCreate({
            where: { codigo_dane: '50001' },
            defaults: {
                nombre_municipio: 'Villavicencio',
                codigo_dane: '50001',
                id_departamento: departamento.id_departamento
            }
        });
        
        // 8. Crear una parroquia básica
        await models.Parroquia.findOrCreate({
            where: { nombre: 'Parroquia San José' },
            defaults: {
                nombre: 'Parroquia San José',
                id_municipio: municipio.id_municipio
            }
        });
        
        console.log('✅ Datos geográficos básicos creados');
        
        // 9. Crear tipos de vivienda básicos
        console.log('🏠 Creando tipos de vivienda...');
        const tiposVivienda = [
            { nombre: 'Casa', descripcion: 'Casa independiente' },
            { nombre: 'Apartamento', descripcion: 'Apartamento' },
            { nombre: 'Finca', descripcion: 'Finca o casa de campo' },
            { nombre: 'Otro', descripcion: 'Otro tipo de vivienda' }
        ];
        
        for (const tipo of tiposVivienda) {
            await models.TipoVivienda.findOrCreate({
                where: { nombre: tipo.nombre },
                defaults: tipo
            });
        }
        console.log('✅ Tipos de vivienda creados');
        
        console.log('');
        console.log('🎉 ¡Datos básicos creados exitosamente!');
        console.log('');
        console.log('📋 Credenciales de acceso:');
        console.log('   Email: admin@parroquia.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('🌐 URLs disponibles:');
        console.log('   API: http://localhost:3000/api');
        console.log('   Docs: http://localhost:3000/api-docs');
        console.log('   Health: http://localhost:3000/api/health');
        
    } catch (error) {
        console.error('❌ Error creando datos básicos:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar si el archivo se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    crearDatosBasicos()
        .then(() => {
            console.log('✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default crearDatosBasicos;
