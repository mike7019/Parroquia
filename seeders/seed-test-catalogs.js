/**
 * Script para poblar catálogos necesarios para tests
 * Crea registros en profesiones, destrezas y habilidades
 */

import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import chalk from 'chalk';

async function seedTestCatalogs() {
  console.log(chalk.blue('\n🌱 INICIANDO SEED DE CATÁLOGOS PARA TESTING\n'));

  try {
    // ===== 1. PROFESIONES =====
    console.log(chalk.yellow('📋 1. Verificando PROFESIONES...'));

    const profesionesExistentes = await sequelize.query(
      'SELECT COUNT(*) as count FROM profesiones',
      { type: QueryTypes.SELECT }
    );

    console.log(`   Profesiones existentes: ${profesionesExistentes[0].count}`);

    if (profesionesExistentes[0].count === 0) {
      console.log(chalk.cyan('   Creando profesiones...'));

      await sequelize.query(`
        INSERT INTO profesiones (nombre, descripcion, created_at, updated_at) 
        VALUES 
          ('Agricultor', 'Persona dedicada a la agricultura', NOW(), NOW()),
          ('Ganadero', 'Persona dedicada a la ganadería', NOW(), NOW()),
          ('Comerciante', 'Persona dedicada al comercio', NOW(), NOW()),
          ('Docente', 'Profesional de la educación', NOW(), NOW()),
          ('Enfermero/a', 'Profesional de la salud', NOW(), NOW()),
          ('Mecánico', 'Técnico en mecánica', NOW(), NOW()),
          ('Carpintero', 'Artesano de la madera', NOW(), NOW()),
          ('Electricista', 'Técnico en electricidad', NOW(), NOW()),
          ('Albañil', 'Trabajador de la construcción', NOW(), NOW()),
          ('Conductor', 'Conductor de vehículos', NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING
      `, { type: QueryTypes.INSERT });

      console.log(chalk.green('   ✓ 10 profesiones creadas'));
    } else {
      console.log(chalk.green('   ✓ Profesiones ya existen'));
    }

    // ===== 2. DESTREZAS =====
    console.log(chalk.yellow('\n📋 2. Verificando DESTREZAS...'));

    // Verificar si la tabla existe
    const tablaDestrezasExiste = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'destrezas'
      )
    `, { type: QueryTypes.SELECT });

    if (!tablaDestrezasExiste[0].exists) {
      console.log(chalk.red('   ✗ Tabla "destrezas" no existe. Creando...'));

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS destrezas (
          id_destrezas BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL UNIQUE,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `, { type: QueryTypes.RAW });

      console.log(chalk.green('   ✓ Tabla "destrezas" creada'));
    }

    const destrezasExistentes = await sequelize.query(
      'SELECT COUNT(*) as count FROM destrezas',
      { type: QueryTypes.SELECT }
    );

    console.log(`   Destrezas existentes: ${destrezasExistentes[0].count}`);

    if (destrezasExistentes[0].count === 0) {
      console.log(chalk.cyan('   Creando destrezas...'));

      await sequelize.query(`
        INSERT INTO destrezas (nombre, descripcion, created_at, updated_at) 
        VALUES 
          ('Carpintería', 'Habilidad para trabajar la madera', NOW(), NOW()),
          ('Electricidad', 'Conocimientos en instalaciones eléctricas', NOW(), NOW()),
          ('Plomería', 'Habilidad en sistemas de agua y desagüe', NOW(), NOW()),
          ('Cocina', 'Destreza en preparación de alimentos', NOW(), NOW()),
          ('Costura', 'Habilidad para confeccionar prendas', NOW(), NOW()),
          ('Mecánica', 'Conocimientos en reparación de vehículos', NOW(), NOW()),
          ('Albañilería', 'Destreza en construcción y mampostería', NOW(), NOW()),
          ('Agricultura', 'Conocimientos en cultivo de la tierra', NOW(), NOW()),
          ('Ganadería', 'Manejo de ganado y animales', NOW(), NOW()),
          ('Pintura', 'Habilidad en pintura artística o de construcción', NOW(), NOW()),
          ('Soldadura', 'Destreza en trabajos de soldadura', NOW(), NOW()),
          ('Informática', 'Conocimientos en computación y tecnología', NOW(), NOW()),
          ('Artesanía', 'Habilidad en trabajos manuales y artesanales', NOW(), NOW()),
          ('Conducción', 'Destreza para conducir vehículos', NOW(), NOW()),
          ('Música', 'Habilidad musical o canto', NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING
      `, { type: QueryTypes.INSERT });

      console.log(chalk.green('   ✓ 15 destrezas creadas'));
    } else {
      console.log(chalk.green('   ✓ Destrezas ya existen'));
    }

    // ===== 3. HABILIDADES =====
    console.log(chalk.yellow('\n📋 3. Verificando HABILIDADES...'));

    // Verificar si la tabla existe
    const tablaHabilidadesExiste = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'habilidades'
      )
    `, { type: QueryTypes.SELECT });

    if (!tablaHabilidadesExiste[0].exists) {
      console.log(chalk.red('   ✗ Tabla "habilidades" no existe. Creando...'));

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS habilidades (
          id_habilidades BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL UNIQUE,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `, { type: QueryTypes.RAW });

      console.log(chalk.green('   ✓ Tabla "habilidades" creada'));
    }

    const habilidadesExistentes = await sequelize.query(
      'SELECT COUNT(*) as count FROM habilidades',
      { type: QueryTypes.SELECT }
    );

    console.log(`   Habilidades existentes: ${habilidadesExistentes[0].count}`);

    if (habilidadesExistentes[0].count === 0) {
      console.log(chalk.cyan('   Creando habilidades...'));

      await sequelize.query(`
        INSERT INTO habilidades (nombre, descripcion, created_at, updated_at) 
        VALUES 
          ('Liderazgo', 'Capacidad para dirigir y motivar grupos', NOW(), NOW()),
          ('Comunicación', 'Habilidad para expresarse y relacionarse', NOW(), NOW()),
          ('Trabajo en equipo', 'Capacidad para colaborar efectivamente', NOW(), NOW()),
          ('Resolución de problemas', 'Habilidad para encontrar soluciones', NOW(), NOW()),
          ('Creatividad', 'Capacidad de generar ideas innovadoras', NOW(), NOW()),
          ('Organización', 'Habilidad para planificar y ordenar', NOW(), NOW()),
          ('Adaptabilidad', 'Capacidad de ajustarse a cambios', NOW(), NOW()),
          ('Empatía', 'Habilidad para comprender emociones ajenas', NOW(), NOW()),
          ('Negociación', 'Capacidad para llegar a acuerdos', NOW(), NOW()),
          ('Pensamiento crítico', 'Habilidad de análisis y razonamiento', NOW(), NOW()),
          ('Servicio al cliente', 'Capacidad de atención y ayuda', NOW(), NOW()),
          ('Gestión del tiempo', 'Habilidad para administrar tiempo', NOW(), NOW()),
          ('Ventas', 'Capacidad para comercializar productos', NOW(), NOW()),
          ('Enseñanza', 'Habilidad para transmitir conocimientos', NOW(), NOW()),
          ('Paciencia', 'Capacidad de mantener la calma', NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING
      `, { type: QueryTypes.INSERT });

      console.log(chalk.green('   ✓ 15 habilidades creadas'));
    } else {
      console.log(chalk.green('   ✓ Habilidades ya existen'));
    }

    // ===== VERIFICACIÓN FINAL =====
    console.log(chalk.blue('\n📊 VERIFICACIÓN FINAL:'));

    const profesionesFinales = await sequelize.query(
      'SELECT COUNT(*) as count FROM profesiones',
      { type: QueryTypes.SELECT }
    );

    const destrezasFinales = await sequelize.query(
      'SELECT COUNT(*) as count FROM destrezas',
      { type: QueryTypes.SELECT }
    );

    const habilidadesFinales = await sequelize.query(
      'SELECT COUNT(*) as count FROM habilidades',
      { type: QueryTypes.SELECT }
    );

    console.log(chalk.green(`   ✓ Profesiones: ${profesionesFinales[0].count}`));
    console.log(chalk.green(`   ✓ Destrezas: ${destrezasFinales[0].count}`));
    console.log(chalk.green(`   ✓ Habilidades: ${habilidadesFinales[0].count}`));

    // Mostrar primeros 5 registros de cada tabla para verificación
    console.log(chalk.blue('\n📋 MUESTRA DE DATOS:'));

    const profesiones = await sequelize.query(
      'SELECT id_profesion, nombre FROM profesiones ORDER BY id_profesion LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(chalk.cyan('\n   Profesiones (primeras 5):'));
    profesiones.forEach(p => console.log(`      ID ${p.id_profesion}: ${p.nombre}`));

    const destrezas = await sequelize.query(
      'SELECT id_destrezas, nombre FROM destrezas ORDER BY id_destrezas LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(chalk.cyan('\n   Destrezas (primeras 5):'));
    destrezas.forEach(d => console.log(`      ID ${d.id_destrezas}: ${d.nombre}`));

    const habilidades = await sequelize.query(
      'SELECT id_habilidades, nombre FROM habilidades ORDER BY id_habilidades LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(chalk.cyan('\n   Habilidades (primeras 5):'));
    habilidades.forEach(h => console.log(`      ID ${h.id_habilidades}: ${h.nombre}`));

    console.log(chalk.green.bold('\n✅ SEED DE CATÁLOGOS COMPLETADO EXITOSAMENTE\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ ERROR EN SEED:'), error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
seedTestCatalogs()
  .then(() => {
    console.log(chalk.blue('🎉 Proceso finalizado'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red('💥 Error fatal:'), error);
    process.exit(1);
  });
