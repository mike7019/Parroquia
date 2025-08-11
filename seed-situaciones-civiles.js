/**
 * Seeder para Situaciones Civiles
 * Inserta los estados civiles básicos del sistema
 */

import sequelize from './config/sequelize.js';
import { SituacionCivil } from './src/models/index.js';

const situacionesCiviles = [
  {
    nombre: 'Soltero(a)',
    descripcion: 'Persona que no ha contraído matrimonio',
    codigo: 'SOL',
    orden: 1,
    activo: true
  },
  {
    nombre: 'Casado(a)',
    descripcion: 'Persona unida en matrimonio civil o religioso',
    codigo: 'CAS',
    orden: 2,
    activo: true
  },
  {
    nombre: 'Unión Libre',
    descripcion: 'Persona en unión de hecho sin matrimonio formal',
    codigo: 'UL',
    orden: 3,
    activo: true
  },
  {
    nombre: 'Separado(a)',
    descripcion: 'Persona casada que vive separada de su cónyuge',
    codigo: 'SEP',
    orden: 4,
    activo: true
  },
  {
    nombre: 'Divorciado(a)',
    descripcion: 'Persona que ha disuelto su matrimonio legalmente',
    codigo: 'DIV',
    orden: 5,
    activo: true
  },
  {
    nombre: 'Viudo(a)',
    descripcion: 'Persona cuyo cónyuge ha fallecido',
    codigo: 'VIU',
    orden: 6,
    activo: true
  }
];

async function seedSituacionesCiviles() {
  try {
    console.log('🌱 Iniciando seeder de Situaciones Civiles...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Insertar situaciones civiles
    console.log('📝 Insertando situaciones civiles...');
    
    for (const situacion of situacionesCiviles) {
      try {
        const [situacionCivil, created] = await SituacionCivil.findOrCreate({
          where: { 
            codigo: situacion.codigo 
          },
          defaults: situacion
        });

        if (created) {
          console.log(`✅ Creado: ${situacion.nombre} (${situacion.codigo})`);
        } else {
          console.log(`ℹ️  Ya existe: ${situacion.nombre} (${situacion.codigo})`);
        }
      } catch (error) {
        console.error(`❌ Error al crear ${situacion.nombre}:`, error.message);
      }
    }

    // Mostrar resumen
    const total = await SituacionCivil.count();
    console.log(`\n📊 Resumen:`);
    console.log(`   Total situaciones civiles: ${total}`);

    // Mostrar las situaciones civiles creadas
    const situaciones = await SituacionCivil.findAll({
      order: [['orden', 'ASC']]
    });

    console.log('\n📋 Situaciones Civiles en el sistema:');
    situaciones.forEach(situacion => {
      console.log(`   ${situacion.orden}. ${situacion.nombre} (${situacion.codigo}) - ${situacion.activo ? 'Activo' : 'Inactivo'}`);
    });

    console.log('\n🎉 Seeder completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar seeder
seedSituacionesCiviles();
