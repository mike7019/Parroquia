/**
 * Script de migración: Asociar personas con parroquias
 * 
 * Problema: Las personas creadas mediante encuestas no heredaban
 * los campos geográficos (id_parroquia, id_municipio, id_vereda, id_sector)
 * de sus familias.
 * 
 * Solución: Este script actualiza todas las personas que tienen id_parroquia
 * NULL para que hereden estos campos de su familia asociada.
 * 
 * Uso:
 *   node scripts/migrar-parroquia-personas.js
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD || 'parroquia_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function migrarParroquiaPersonas() {
  try {
    console.log('🔄 Iniciando migración de asociación geográfica de personas...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // 2. Verificar estado ANTES de la migración
    const [personasSinParroquia] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas
      WHERE id_parroquia IS NULL
    `);

    const [personasConFamilia] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas p
      INNER JOIN familias f ON p.id_familia_familias = f.id_familia
      WHERE p.id_parroquia IS NULL
      AND f.id_parroquia IS NOT NULL
    `);

    console.log('📊 ESTADO ANTES DE LA MIGRACIÓN:');
    console.log(`   - Personas sin parroquia: ${personasSinParroquia[0].total}`);
    console.log(`   - Personas que pueden heredar parroquia de su familia: ${personasConFamilia[0].total}\n`);

    if (personasConFamilia[0].total === '0') {
      console.log('✅ No hay personas que requieran actualización');
      await sequelize.close();
      return;
    }

    // 3. Ejecutar la migración
    console.log('🔧 Ejecutando actualización...');
    const [result] = await sequelize.query(`
      UPDATE personas p
      SET id_parroquia = f.id_parroquia
      FROM familias f
      WHERE p.id_familia_familias = f.id_familia
      AND p.id_parroquia IS NULL
      AND f.id_parroquia IS NOT NULL
    `);

    console.log(`✅ Actualización completada: ${result.rowCount || personasConFamilia[0].total} personas actualizadas\n`);

    // 4. Verificar estado DESPUÉS de la migración
    const [personasSinParroquiaDespues] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas
      WHERE id_parroquia IS NULL
    `);

    const [personasConParroquia] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM personas
      WHERE id_parroquia IS NOT NULL
    `);

    console.log('📊 ESTADO DESPUÉS DE LA MIGRACIÓN:');
    console.log(`   - Personas con parroquia: ${personasConParroquia[0].total}`);
    console.log(`   - Personas sin parroquia: ${personasSinParroquiaDespues[0].total}\n`);

    // 5. Mostrar detalles de las personas actualizadas
    const [personasActualizadas] = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.primer_apellido,
        pa.nombre as nombre_parroquia,
        f.apellido_familiar
      FROM personas p
      INNER JOIN familias f ON p.id_familia_familias = f.id_familia
      LEFT JOIN parroquia pa ON p.id_parroquia = pa.id_parroquia
      WHERE p.id_parroquia IS NOT NULL
      ORDER BY p.id_personas
      LIMIT 20
    `);

    console.log('📋 MUESTRA DE PERSONAS ACTUALIZADAS (primeras 20):');
    console.log('─'.repeat(80));
    personasActualizadas.forEach(persona => {
      console.log(`   ${persona.id_personas}. ${persona.primer_nombre} ${persona.primer_apellido} (Familia: ${persona.apellido_familiar})`);
      console.log(`      📍 Parroquia: ${persona.nombre_parroquia || 'N/A'}\n`);
    });

    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar migración
migrarParroquiaPersonas();
