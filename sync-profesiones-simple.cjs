// Cargar variables de entorno
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos usando las variables de entorno
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  database: process.env.DB_NAME || 'parroquia_db',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Definir el modelo Profesion simple (compatible con estructura existente)
const Profesion = sequelize.define('Profesion', {
  id_profesion: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Profesion',
  tableName: 'profesiones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

async function syncProfesionesSimple() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente');

        console.log('🔧 Sincronizando tabla profesiones (estructura simple)...');
        await Profesion.sync({ force: false });
        console.log('✅ Tabla profesiones sincronizada exitosamente');

        // Verificar si ya existen datos
        const count = await Profesion.count();
        console.log(`📊 Registros existentes: ${count}`);

        // Si no hay datos, insertar algunos básicos
        if (count === 0) {
            console.log('📝 Insertando datos básicos de profesiones...');
            
            const profesionesBasicas = [
                { nombre: 'Médico', descripcion: 'Profesional de la salud' },
                { nombre: 'Enfermero/a', descripcion: 'Profesional de enfermería' },
                { nombre: 'Docente', descripcion: 'Educador profesional' },
                { nombre: 'Ingeniero', descripcion: 'Profesional en ingeniería' },
                { nombre: 'Abogado', descripcion: 'Profesional en derecho' },
                { nombre: 'Administrador', descripcion: 'Profesional en administración' },
                { nombre: 'Contador', descripcion: 'Profesional en contabilidad' },
                { nombre: 'Agrónomo', descripcion: 'Profesional en agricultura' },
                { nombre: 'Veterinario', descripcion: 'Profesional en medicina veterinaria' },
                { nombre: 'Comerciante', descripcion: 'Persona dedicada al comercio' },
                { nombre: 'Agricultor', descripcion: 'Trabajador del campo' },
                { nombre: 'Ganadero', descripcion: 'Criador de ganado' },
                { nombre: 'Conductor', descripcion: 'Operador de vehículos' },
                { nombre: 'Mecánico', descripcion: 'Técnico en mecánica' },
                { nombre: 'Electricista', descripcion: 'Técnico electricista' },
                { nombre: 'Carpintero', descripcion: 'Artesano de la madera' },
                { nombre: 'Albañil', descripcion: 'Trabajador de la construcción' },
                { nombre: 'Ama de Casa', descripcion: 'Dedicada al hogar' },
                { nombre: 'Estudiante', descripcion: 'En formación académica' },
                { nombre: 'Pensionado', descripcion: 'Jubilado' }
            ];

            await Profesion.bulkCreate(profesionesBasicas);
            console.log(`✅ ${profesionesBasicas.length} registros insertados exitosamente`);
        }

        // Consulta de verificación
        const profesiones = await Profesion.findAll({
            order: [['nombre', 'ASC']],
            limit: 10
        });

        console.log('📋 Primeras 10 profesiones:');
        profesiones.forEach(p => {
            console.log(`  - ID: ${p.id_profesion}, Nombre: ${p.nombre}`);
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

syncProfesionesSimple();
