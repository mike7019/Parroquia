/**
 * Seeder para datos iniciales de Estudios (Niveles Educativos)
 * Agrega niveles educativos básicos si no existen
 */

import sequelize from './config/sequelize.js';
import Estudio from './src/models/catalog/Estudio.js';

const estudiosBasicos = [
  {
    nivel: 'Sin educación formal',
    descripcion: 'No tiene educación formal registrada',
    ordenNivel: 1,
    activo: true
  },
  {
    nivel: 'Preescolar',
    descripcion: 'Educación preescolar básica',
    ordenNivel: 2,
    activo: true
  },
  {
    nivel: 'Primaria incompleta',
    descripcion: 'Educación primaria sin completar',
    ordenNivel: 3,
    activo: true
  },
  {
    nivel: 'Primaria completa',
    descripcion: 'Educación primaria completa',
    ordenNivel: 4,
    activo: true
  },
  {
    nivel: 'Secundaria incompleta',
    descripcion: 'Educación secundaria sin completar',
    ordenNivel: 5,
    activo: true
  },
  {
    nivel: 'Secundaria completa',
    descripcion: 'Bachillerato completo',
    ordenNivel: 6,
    activo: true
  },
  {
    nivel: 'Técnico',
    descripcion: 'Formación técnica especializada',
    ordenNivel: 7,
    activo: true
  },
  {
    nivel: 'Tecnológico',
    descripcion: 'Formación tecnológica',
    ordenNivel: 8,
    activo: true
  },
  {
    nivel: 'Universitario incompleto',
    descripcion: 'Estudios universitarios en curso',
    ordenNivel: 9,
    activo: true
  },
  {
    nivel: 'Universitario completo',
    descripcion: 'Título universitario',
    ordenNivel: 10,
    activo: true
  },
  {
    nivel: 'Especialización',
    descripcion: 'Estudios de especialización',
    ordenNivel: 11,
    activo: true
  },
  {
    nivel: 'Maestría',
    descripcion: 'Estudios de maestría',
    ordenNivel: 12,
    activo: true
  },
  {
    nivel: 'Doctorado',
    descripcion: 'Estudios doctorales',
    ordenNivel: 13,
    activo: true
  }
];

async function seedEstudios() {
  try {
    console.log('🌱 Iniciando seeder de Estudios...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar cuántos registros ya existen
    const existingCount = await Estudio.count();
    console.log(`📊 Registros existentes: ${existingCount}`);

    if (existingCount >= 10) {
      console.log('ℹ️  Ya hay suficientes registros en la tabla, saltando seeder');
      return;
    }

    console.log('🔄 Insertando estudios básicos...');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const estudioData of estudiosBasicos) {
      try {
        // Verificar si ya existe un estudio con este nivel
        const existing = await Estudio.findOne({
          where: { nivel: estudioData.nivel },
          paranoid: false
        });

        if (existing) {
          console.log(`⏭️  Saltando "${estudioData.nivel}" - ya existe`);
          skippedCount++;
          continue;
        }

        // Crear el nuevo estudio
        const nuevoEstudio = await Estudio.create(estudioData);
        console.log(`✅ Creado: ${nuevoEstudio.nivel} (ID: ${nuevoEstudio.id})`);
        insertedCount++;

      } catch (error) {
        console.error(`❌ Error creando "${estudioData.nivel}":`, error.message);
      }
    }

    console.log(`\n📈 Resumen del seeder:`);
    console.log(`   • Estudios insertados: ${insertedCount}`);
    console.log(`   • Estudios saltados: ${skippedCount}`);
    console.log(`   • Total de estudios: ${insertedCount + skippedCount}`);

    // Mostrar el estado final
    const finalCount = await Estudio.count();
    console.log(`📊 Total de registros en la tabla: ${finalCount}`);

    // Mostrar los estudios ordenados
    console.log('\n📋 Estudios disponibles:');
    const estudios = await Estudio.findAll({
      order: [['ordenNivel', 'ASC']],
      attributes: ['id', 'nivel', 'ordenNivel', 'activo']
    });

    estudios.forEach((estudio, index) => {
      const status = estudio.activo ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${estudio.nivel} (Orden: ${estudio.ordenNivel})`);
    });

    console.log('🎉 Seeder de Estudios completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante el seeder:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si es llamado directamente
const isMainModule = process.argv[1].endsWith('seed-estudios.js');
if (isMainModule) {
  seedEstudios()
    .then(() => {
      console.log('✅ Seeder ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el seeder:', error);
      process.exit(1);
    });
}

export default seedEstudios;
