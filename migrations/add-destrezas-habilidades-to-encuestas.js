/**
 * SCRIPT DE MIGRACIÓN: Agregar campos destrezas, habilidades y liderazgo a encuestas
 * 
 * Este script agrega los campos faltantes para:
 * 1. destrezas (array de objetos {id, nombre})
 * 2. habilidades (array de objetos {id, nombre}) 
 * 3. en_que_eres_lider (texto libre)
 * 
 * Ejecutar: node migrations/add-destrezas-habilidades-to-encuestas.js
 */

import 'dotenv/config';
import sequelize from '../config/sequelize.js';

async function ejecutarMigracion() {
  console.log('🚀 INICIANDO MIGRACIÓN: Campos Destrezas, Habilidades y Liderazgo');
  console.log('='.repeat(70));
  console.log('📅 Fecha:', new Date().toLocaleString());
  console.log('');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    console.log('');

    // ========================================================================
    // PASO 1: Verificar tabla destrezas
    // ========================================================================
    console.log('📋 PASO 1: Verificando tabla destrezas...');
    
    const [destrezasTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'destrezas'
    `);

    if (destrezasTable.length === 0) {
      console.log('⚠️  Tabla destrezas no existe. Creando...');
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS destrezas (
          id_destreza SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          activo BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla destrezas creada');
      
      // Insertar destrezas básicas
      await sequelize.query(`
        INSERT INTO destrezas (nombre, descripcion) VALUES
        ('Carpintería', 'Trabajo en madera y construcción'),
        ('Electricidad', 'Instalaciones y reparaciones eléctricas'),
        ('Plomería', 'Instalaciones sanitarias'),
        ('Albañilería', 'Construcción y mampostería'),
        ('Mecánica', 'Reparación de vehículos'),
        ('Costura', 'Confección y reparación de prendas'),
        ('Cocina', 'Preparación de alimentos'),
        ('Peluquería', 'Corte y peinado'),
        ('Agricultura', 'Cultivo y manejo de plantas'),
        ('Ganadería', 'Cría y cuidado de animales'),
        ('Artesanía', 'Trabajos manuales artísticos'),
        ('Informática', 'Uso de computadoras y software'),
        ('Música', 'Interpretación o composición musical'),
        ('Pintura', 'Arte pictórico'),
        ('Soldadura', 'Unión de metales'),
        ('Panadería', 'Elaboración de pan y productos de panadería'),
        ('Repostería', 'Elaboración de postres'),
        ('Fotografía', 'Captura y edición de imágenes'),
        ('Otra', 'Otra destreza no listada')
        ON CONFLICT DO NOTHING
      `);
      
      console.log('✅ Destrezas básicas insertadas');
    } else {
      const [countDestrezas] = await sequelize.query(
        'SELECT COUNT(*) as total FROM destrezas'
      );
      console.log(`✅ Tabla destrezas existe con ${countDestrezas[0].total} registros`);
    }

    // ========================================================================
    // PASO 2: Verificar tabla persona_destreza (relación muchos a muchos)
    // ========================================================================
    console.log('');
    console.log('📋 PASO 2: Verificando tabla persona_destreza...');
    
    const [personaDestrezaTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'persona_destreza'
    `);

    if (personaDestrezaTable.length === 0) {
      console.log('⚠️  Tabla persona_destreza no existe. Creando...');
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS persona_destreza (
          id_persona_destreza SERIAL PRIMARY KEY,
          id_persona INTEGER NOT NULL REFERENCES personas(id_personas) ON DELETE CASCADE,
          id_destrezas_destrezas INTEGER NOT NULL REFERENCES destrezas(id_destreza) ON DELETE CASCADE,
          nivel VARCHAR(50), -- Básico, Intermedio, Avanzado, Experto
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(id_persona, id_destrezas_destrezas)
        )
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_persona_destreza_persona 
        ON persona_destreza(id_persona)
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_persona_destreza_destreza 
        ON persona_destreza(id_destrezas_destrezas)
      `);
      
      console.log('✅ Tabla persona_destreza creada con índices');
    } else {
      const [countRelaciones] = await sequelize.query(
        'SELECT COUNT(*) as total FROM persona_destreza'
      );
      console.log(`✅ Tabla persona_destreza existe con ${countRelaciones[0].total} relaciones`);
    }

    // ========================================================================
    // PASO 3: Verificar tabla habilidades
    // ========================================================================
    console.log('');
    console.log('📋 PASO 3: Verificando tabla habilidades...');
    
    const [habilidadesTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'habilidades'
    `);

    if (habilidadesTable.length === 0) {
      console.log('⚠️  Tabla habilidades no existe. Creando...');
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS habilidades (
          id_habilidad SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          categoria VARCHAR(50), -- Técnica, Social, Cognitiva, Física
          activo BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla habilidades creada');
      
      // Insertar habilidades básicas
      await sequelize.query(`
        INSERT INTO habilidades (nombre, descripcion, categoria) VALUES
        ('Comunicación efectiva', 'Capacidad para expresarse claramente', 'Social'),
        ('Trabajo en equipo', 'Colaboración con otros', 'Social'),
        ('Liderazgo', 'Guiar y motivar a otros', 'Social'),
        ('Resolución de problemas', 'Encontrar soluciones creativas', 'Cognitiva'),
        ('Pensamiento crítico', 'Analizar información objetivamente', 'Cognitiva'),
        ('Organización', 'Planificar y gestionar tareas', 'Cognitiva'),
        ('Adaptabilidad', 'Ajustarse a nuevas situaciones', 'Social'),
        ('Creatividad', 'Generar ideas innovadoras', 'Cognitiva'),
        ('Empatía', 'Comprender emociones ajenas', 'Social'),
        ('Gestión del tiempo', 'Usar el tiempo eficientemente', 'Cognitiva'),
        ('Negociación', 'Llegar a acuerdos beneficiosos', 'Social'),
        ('Toma de decisiones', 'Elegir la mejor opción', 'Cognitiva'),
        ('Autocontrol', 'Regular emociones y conducta', 'Social'),
        ('Iniciativa', 'Actuar sin esperar órdenes', 'Social'),
        ('Aprendizaje continuo', 'Disposición a adquirir conocimientos', 'Cognitiva'),
        ('Resiliencia', 'Recuperarse de dificultades', 'Social'),
        ('Escucha activa', 'Prestar atención genuina', 'Social'),
        ('Flexibilidad', 'Aceptar cambios con facilidad', 'Social'),
        ('Otra', 'Otra habilidad no listada', 'Otra')
        ON CONFLICT DO NOTHING
      `);
      
      console.log('✅ Habilidades básicas insertadas');
    } else {
      const [countHabilidades] = await sequelize.query(
        'SELECT COUNT(*) as total FROM habilidades'
      );
      console.log(`✅ Tabla habilidades existe con ${countHabilidades[0].total} registros`);
    }

    // ========================================================================
    // PASO 4: Verificar tabla persona_habilidad (relación muchos a muchos)
    // ========================================================================
    console.log('');
    console.log('📋 PASO 4: Verificando tabla persona_habilidad...');
    
    const [personaHabilidadTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'persona_habilidad'
    `);

    if (personaHabilidadTable.length === 0) {
      console.log('⚠️  Tabla persona_habilidad no existe. Creando...');
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS persona_habilidad (
          id_persona_habilidad SERIAL PRIMARY KEY,
          id_persona INTEGER NOT NULL REFERENCES personas(id_personas) ON DELETE CASCADE,
          id_habilidad INTEGER NOT NULL REFERENCES habilidades(id_habilidad) ON DELETE CASCADE,
          nivel VARCHAR(50), -- Básico, Intermedio, Avanzado, Experto
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(id_persona, id_habilidad)
        )
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_persona_habilidad_persona 
        ON persona_habilidad(id_persona)
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_persona_habilidad_habilidad 
        ON persona_habilidad(id_habilidad)
      `);
      
      console.log('✅ Tabla persona_habilidad creada con índices');
    } else {
      const [countRelaciones] = await sequelize.query(
        'SELECT COUNT(*) as total FROM persona_habilidad'
      );
      console.log(`✅ Tabla persona_habilidad existe con ${countRelaciones[0].total} relaciones`);
    }

    // ========================================================================
    // PASO 5: Verificar campo en_que_eres_lider en tabla personas
    // ========================================================================
    console.log('');
    console.log('📋 PASO 5: Verificando campo en_que_eres_lider en tabla personas...');
    
    const [liderazgoColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND column_name = 'en_que_eres_lider'
    `);

    if (liderazgoColumn.length === 0) {
      console.log('⚠️  Campo en_que_eres_lider no existe. Creando...');
      
      await sequelize.query(`
        ALTER TABLE personas 
        ADD COLUMN IF NOT EXISTS en_que_eres_lider TEXT
      `);
      
      console.log('✅ Campo en_que_eres_lider agregado a tabla personas');
    } else {
      console.log('✅ Campo en_que_eres_lider ya existe en tabla personas');
    }

    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================
    console.log('');
    console.log('='.repeat(70));
    console.log('📊 RESUMEN DE LA MIGRACIÓN');
    console.log('='.repeat(70));
    
    const [resumen] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM destrezas) as total_destrezas,
        (SELECT COUNT(*) FROM habilidades) as total_habilidades,
        (SELECT COUNT(*) FROM persona_destreza) as relaciones_destrezas,
        (SELECT COUNT(*) FROM persona_habilidad) as relaciones_habilidades,
        (SELECT COUNT(*) FROM personas WHERE en_que_eres_lider IS NOT NULL) as personas_con_liderazgo
    `);
    
    const r = resumen[0];
    console.log('');
    console.log(`✅ Destrezas en catálogo: ${r.total_destrezas}`);
    console.log(`✅ Habilidades en catálogo: ${r.total_habilidades}`);
    console.log(`✅ Relaciones persona-destreza: ${r.relaciones_destrezas}`);
    console.log(`✅ Relaciones persona-habilidad: ${r.relaciones_habilidades}`);
    console.log(`✅ Personas con liderazgo definido: ${r.personas_con_liderazgo}`);
    console.log('');
    
    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('  1. El JSON de encuestas ahora puede incluir:');
    console.log('     - destrezas: [{ id: 1, nombre: "Carpintería" }]');
    console.log('     - habilidades: [{ id: 1, nombre: "Comunicación efectiva" }]');
    console.log('     - en_que_eres_lider: "Líder comunitario"');
    console.log('  2. Actualizar el controlador de encuestas para procesar estos campos');
    console.log('  3. Probar la creación de encuestas con los nuevos campos');
    console.log('');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('❌ ERROR EN LA MIGRACIÓN:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    console.error('');
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar migración
ejecutarMigracion();
