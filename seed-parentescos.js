/**
 * Seeder para la tabla de Parentescos
 * Puebla la tabla con los tipos de parentesco más comunes para encuestas familiares
 */

import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar el modelo
import './src/models/index.js';

const { Parentesco } = sequelize.models;

const parentescosData = [
  {
    nombre: 'Jefe de hogar',
    descripcion: 'Persona responsable principal del hogar',
    activo: true
  },
  {
    nombre: 'Esposo(a)',
    descripcion: 'Cónyuge del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Hijo(a)',
    descripcion: 'Hijo o hija del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Padre',
    descripcion: 'Padre del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Madre',
    descripcion: 'Madre del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Hermano(a)',
    descripcion: 'Hermano o hermana del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Abuelo(a)',
    descripcion: 'Abuelo o abuela del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Nieto(a)',
    descripcion: 'Nieto o nieta del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Yerno',
    descripcion: 'Esposo de la hija del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Nuera',
    descripcion: 'Esposa del hijo del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Suegro(a)',
    descripcion: 'Padre o madre del cónyuge',
    activo: true
  },
  {
    nombre: 'Cuñado(a)',
    descripcion: 'Hermano o hermana del cónyuge',
    activo: true
  },
  {
    nombre: 'Tío(a)',
    descripcion: 'Tío o tía del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Sobrino(a)',
    descripcion: 'Sobrino o sobrina del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Primo(a)',
    descripcion: 'Primo o prima del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Bisabuelo(a)',
    descripcion: 'Bisabuelo o bisabuela del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Bisnieto(a)',
    descripcion: 'Bisnieto o bisnieta del jefe de hogar',
    activo: true
  },
  {
    nombre: 'Hijastro(a)',
    descripcion: 'Hijo o hija del cónyuge de una relación anterior',
    activo: true
  },
  {
    nombre: 'Padrastro',
    descripcion: 'Esposo de la madre, no siendo el padre biológico',
    activo: true
  },
  {
    nombre: 'Madrastra',
    descripcion: 'Esposa del padre, no siendo la madre biológica',
    activo: true
  },
  {
    nombre: 'Hermanastro(a)',
    descripcion: 'Hijo o hija del padrastro o madrastra',
    activo: true
  },
  {
    nombre: 'Padrino',
    descripcion: 'Padrino de bautismo o confirmación',
    activo: true
  },
  {
    nombre: 'Madrina',
    descripcion: 'Madrina de bautismo o confirmación',
    activo: true
  },
  {
    nombre: 'Ahijado(a)',
    descripcion: 'Ahijado o ahijada',
    activo: true
  },
  {
    nombre: 'Compadre',
    descripcion: 'Padre del ahijado o padrino del hijo',
    activo: true
  },
  {
    nombre: 'Comadre',
    descripcion: 'Madre del ahijado o madrina del hijo',
    activo: true
  },
  {
    nombre: 'Empleado(a) doméstico(a)',
    descripcion: 'Persona que trabaja en el hogar',
    activo: true
  },
  {
    nombre: 'Inquilino(a)',
    descripcion: 'Persona que arrienda una habitación en el hogar',
    activo: true
  },
  {
    nombre: 'Amigo(a)',
    descripcion: 'Amigo o amiga que vive en el hogar',
    activo: true
  },
  {
    nombre: 'Sin parentesco',
    descripcion: 'Persona sin relación familiar que vive en el hogar',
    activo: true
  }
];

async function seedParentescos() {
  try {
    console.log('🌱 Iniciando seeder de Parentescos...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si la tabla existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    if (!tableExists.includes('parentescos')) {
      console.log('❌ La tabla parentescos no existe. Ejecuta sync primero.');
      process.exit(1);
    }

    // Verificar si ya existen registros
    const existingCount = await Parentesco.count();
    console.log(`📊 Registros existentes en parentescos: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  La tabla ya contiene datos. ¿Deseas continuar? (Esto agregará más registros)');
      
      // En un entorno automatizado, podemos decidir qué hacer
      const forceInsert = process.argv.includes('--force');
      if (!forceInsert) {
        console.log('💡 Usa --force para insertar de todas formas');
        console.log('🔍 Mostrando registros existentes:');
        
        const existing = await Parentesco.findAll({
          attributes: ['id', 'nombre', 'descripcion', 'activo'],
          order: [['nombre', 'ASC']]
        });
        
        existing.forEach((parentesco, index) => {
          console.log(`   ${index + 1}. ${parentesco.nombre} - ${parentesco.descripcion} (${parentesco.activo ? 'Activo' : 'Inactivo'})`);
        });
        
        process.exit(0);
      }
    }

    console.log('📝 Insertando parentescos...');
    
    // Usar transacción para asegurar consistencia
    const transaction = await sequelize.transaction();
    
    try {
      const insertedRecords = [];
      
      for (const parentescoData of parentescosData) {
        // Verificar si ya existe un parentesco con el mismo nombre
        const existing = await Parentesco.findOne({
          where: { nombre: parentescoData.nombre },
          transaction
        });
        
        if (!existing) {
          const parentesco = await Parentesco.create(parentescoData, { transaction });
          insertedRecords.push(parentesco);
          console.log(`   ✅ ${parentesco.nombre}`);
        } else {
          console.log(`   ⚠️  ${parentescoData.nombre} ya existe (ID: ${existing.id})`);
        }
      }

      await transaction.commit();
      
      console.log(`\n🎉 Seeder completado exitosamente!`);
      console.log(`   • Registros insertados: ${insertedRecords.length}`);
      console.log(`   • Registros duplicados omitidos: ${parentescosData.length - insertedRecords.length}`);
      
      // Mostrar estadísticas finales
      const finalCount = await Parentesco.count();
      const activeCount = await Parentesco.count({ where: { activo: true } });
      const inactiveCount = finalCount - activeCount;
      
      console.log(`\n📊 Estadísticas finales:`);
      console.log(`   • Total de parentescos: ${finalCount}`);
      console.log(`   • Activos: ${activeCount}`);
      console.log(`   • Inactivos: ${inactiveCount}`);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 Asegúrate de que la base de datos esté corriendo y las credenciales sean correctas');
    } else if (error.name === 'SequelizeValidationError') {
      console.error('💡 Error de validación en los datos:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔄 Conexión cerrada');
  }
}

// Ejecutar el seeder si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedParentescos();
}

export default seedParentescos;
