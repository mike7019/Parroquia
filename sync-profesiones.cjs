// Cargar variables de entorno
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

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

// Definir el modelo Profesion
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
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El nombre de la profesión no puede estar vacío'
      },
      len: {
        args: [2, 255],
        msg: 'El nombre debe tener entre 2 y 255 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'La descripción no puede exceder los 1000 caracteres'
      }
    }
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'La categoría no puede exceder los 100 caracteres'
      }
    }
  },
  nivel_educativo_requerido: {
    type: DataTypes.ENUM(
      'Primaria',
      'Secundaria',
      'Técnico',
      'Tecnológico',
      'Universitario',
      'Especialización',
      'Maestría',
      'Doctorado',
      'No requerido'
    ),
    allowNull: true,
    defaultValue: 'No requerido'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Profesion',
  tableName: 'profesiones',
  timestamps: true,
  paranoid: false,
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['nivel_educativo_requerido']
    },
    {
      fields: ['createdAt']
    }
  ]
});

async function syncProfesiones() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente');

        console.log('🔧 Sincronizando tabla profesiones...');
        await Profesion.sync({ force: false });
        console.log('✅ Tabla profesiones sincronizada exitosamente');

        // Verificar si ya existen datos
        const count = await Profesion.count();
        console.log(`📊 Registros existentes: ${count}`);

        // Si no hay datos, insertar algunos de muestra
        if (count === 0) {
            console.log('📝 Insertando datos de muestra...');
            
            const datosEjemplo = [
                // Salud
                { nombre: 'Médico General', descripcion: 'Profesional de la medicina especializado en atención primaria', categoria: 'Salud', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Médico Especialista', descripcion: 'Médico con especialización en área específica', categoria: 'Salud', nivel_educativo_requerido: 'Especialización', activo: true },
                { nombre: 'Enfermero/a', descripcion: 'Profesional de enfermería especializado en cuidados de salud', categoria: 'Salud', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Auxiliar de Enfermería', descripcion: 'Técnico en cuidados básicos de enfermería', categoria: 'Salud', nivel_educativo_requerido: 'Técnico', activo: true },
                { nombre: 'Odontólogo', descripcion: 'Profesional especializado en salud oral y dental', categoria: 'Salud', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Fisioterapeuta', descripcion: 'Especialista en rehabilitación física y terapia', categoria: 'Salud', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Psicólogo', descripcion: 'Profesional especializado en salud mental y comportamiento', categoria: 'Salud', nivel_educativo_requerido: 'Universitario', activo: true },
                
                // Educación
                { nombre: 'Docente Primaria', descripcion: 'Educador especializado en educación básica primaria', categoria: 'Educación', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Docente Secundaria', descripcion: 'Educador especializado en educación secundaria', categoria: 'Educación', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Rector/Directivo', descripcion: 'Directivo educativo y administrador académico', categoria: 'Educación', nivel_educativo_requerido: 'Especialización', activo: true },
                { nombre: 'Coordinador Académico', descripcion: 'Profesional encargado de coordinar procesos académicos', categoria: 'Educación', nivel_educativo_requerido: 'Especialización', activo: true },
                
                // Ingeniería
                { nombre: 'Ingeniero Civil', descripcion: 'Profesional en diseño y construcción de infraestructuras', categoria: 'Ingeniería', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Ingeniero de Sistemas', descripcion: 'Especialista en desarrollo y gestión de sistemas informáticos', categoria: 'Ingeniería', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Ingeniero Industrial', descripcion: 'Profesional en optimización de procesos industriales', categoria: 'Ingeniería', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Ingeniero Electrónico', descripcion: 'Especialista en sistemas electrónicos y telecomunicaciones', categoria: 'Ingeniería', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Ingeniero Ambiental', descripcion: 'Profesional en gestión y protección ambiental', categoria: 'Ingeniería', nivel_educativo_requerido: 'Universitario', activo: true },
                
                // Derecho
                { nombre: 'Abogado', descripcion: 'Profesional en derecho y asesoría jurídica', categoria: 'Derecho', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Juez', descripcion: 'Magistrado encargado de administrar justicia', categoria: 'Derecho', nivel_educativo_requerido: 'Especialización', activo: true },
                { nombre: 'Notario', descripcion: 'Funcionario público encargado de dar fe de actos jurídicos', categoria: 'Derecho', nivel_educativo_requerido: 'Especialización', activo: true },
                
                // Administración
                { nombre: 'Administrador de Empresas', descripcion: 'Profesional en gestión y administración empresarial', categoria: 'Administración', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Contador Público', descripcion: 'Profesional en contabilidad y finanzas', categoria: 'Administración', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Economista', descripcion: 'Especialista en análisis económico y financiero', categoria: 'Administración', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Secretario/a', descripcion: 'Asistente administrativo y de oficina', categoria: 'Administración', nivel_educativo_requerido: 'Técnico', activo: true },
                
                // Agropecuario
                { nombre: 'Agrónomo', descripcion: 'Profesional en ciencias agrícolas y producción agropecuaria', categoria: 'Agropecuario', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Veterinario', descripcion: 'Profesional en medicina veterinaria y salud animal', categoria: 'Agropecuario', nivel_educativo_requerido: 'Universitario', activo: true },
                { nombre: 'Agricultor', descripcion: 'Trabajador especializado en cultivo y producción agrícola', categoria: 'Agropecuario', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Ganadero', descripcion: 'Especialista en cría y manejo de ganado', categoria: 'Agropecuario', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Técnico Agropecuario', descripcion: 'Técnico en producción agropecuaria', categoria: 'Agropecuario', nivel_educativo_requerido: 'Técnico', activo: true },
                
                // Servicios
                { nombre: 'Comerciante', descripcion: 'Persona dedicada a actividades comerciales', categoria: 'Servicios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Conductor', descripcion: 'Profesional del transporte de personas o mercancías', categoria: 'Servicios', nivel_educativo_requerido: 'Secundaria', activo: true },
                { nombre: 'Mecánico', descripcion: 'Técnico en reparación y mantenimiento de vehículos', categoria: 'Servicios', nivel_educativo_requerido: 'Técnico', activo: true },
                { nombre: 'Electricista', descripcion: 'Técnico especializado en instalaciones eléctricas', categoria: 'Servicios', nivel_educativo_requerido: 'Técnico', activo: true },
                { nombre: 'Plomero', descripcion: 'Técnico en instalaciones hidráulicas y sanitarias', categoria: 'Servicios', nivel_educativo_requerido: 'Técnico', activo: true },
                { nombre: 'Carpintero', descripcion: 'Artesano especializado en trabajo con madera', categoria: 'Servicios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Albañil', descripcion: 'Trabajador especializado en construcción', categoria: 'Servicios', nivel_educativo_requerido: 'No requerido', activo: true },
                
                // Oficios Varios
                { nombre: 'Ama de Casa', descripcion: 'Persona dedicada al cuidado del hogar', categoria: 'Oficios Varios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Estudiante', descripcion: 'Persona en proceso de formación académica', categoria: 'Oficios Varios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Pensionado', descripcion: 'Persona retirada laboralmente con pensión', categoria: 'Oficios Varios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Desempleado', descripcion: 'Persona sin actividad laboral actual', categoria: 'Oficios Varios', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Trabajador Independiente', descripcion: 'Persona que trabaja por cuenta propia', categoria: 'Oficios Varios', nivel_educativo_requerido: 'No requerido', activo: true },
                
                // Seguridad
                { nombre: 'Policía', descripcion: 'Agente de seguridad pública', categoria: 'Seguridad', nivel_educativo_requerido: 'Secundaria', activo: true },
                { nombre: 'Militar', descripcion: 'Miembro de las fuerzas armadas', categoria: 'Seguridad', nivel_educativo_requerido: 'Secundaria', activo: true },
                { nombre: 'Vigilante', descripcion: 'Agente de seguridad privada', categoria: 'Seguridad', nivel_educativo_requerido: 'Secundaria', activo: true },
                
                // Arte y Cultura
                { nombre: 'Artista', descripcion: 'Profesional dedicado a las artes', categoria: 'Arte y Cultura', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Músico', descripcion: 'Profesional de la música', categoria: 'Arte y Cultura', nivel_educativo_requerido: 'No requerido', activo: true },
                { nombre: 'Periodista', descripcion: 'Profesional de la comunicación y medios', categoria: 'Arte y Cultura', nivel_educativo_requerido: 'Universitario', activo: true }
            ];

            await Profesion.bulkCreate(datosEjemplo);
            console.log(`✅ ${datosEjemplo.length} registros insertados exitosamente`);
        }

        // Consulta de verificación
        const profesiones = await Profesion.findAll({
            order: [['categoria', 'ASC'], ['nombre', 'ASC']],
            limit: 10
        });

        console.log('📋 Primeras 10 profesiones por categoría:');
        profesiones.forEach(p => {
            console.log(`  - ID: ${p.id_profesion}, Nombre: ${p.nombre}, Categoría: ${p.categoria}, Nivel: ${p.nivel_educativo_requerido}`);
        });

        // Estadísticas por categoría
        const estatsPorCategoria = await Profesion.findAll({
            where: { activo: true },
            attributes: [
                'categoria',
                [sequelize.fn('COUNT', sequelize.col('*')), 'cantidad']
            ],
            group: ['categoria'],
            order: [[sequelize.literal('cantidad'), 'DESC']]
        });

        console.log('\n📊 Estadísticas por categoría:');
        estatsPorCategoria.forEach(stat => {
            console.log(`  - ${stat.categoria || 'Sin categoría'}: ${stat.dataValues.cantidad} profesiones`);
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

syncProfesiones();
