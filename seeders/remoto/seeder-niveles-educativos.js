/**
 * Seeder para NIVELES EDUCATIVOS (Estudios)
 * Sistema educativo colombiano
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

async function insertarNivelesEducativos() {
  try {
    console.log('🎓 INSERTANDO NIVELES EDUCATIVOS');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar y reinsertar
    await sequelize.query('DELETE FROM niveles_educativos;');
    await sequelize.query('ALTER SEQUENCE niveles_educativos_id_niveles_educativos_seq RESTART WITH 1;');
    console.log('🗑️  Tabla limpiada\n');

    console.log('📝 Insertando niveles educativos...\n');

    const nivelesEducativos = [
      { nivel: 'Ninguno', descripcion: 'Sin educación formal', orden_nivel: 0, activo: true },
      { nivel: 'Preescolar', descripcion: 'Educación preescolar o jardín infantil', orden_nivel: 1, activo: true },
      { nivel: 'Primaria Incompleta', descripcion: 'Primaria sin terminar (1º a 5º)', orden_nivel: 2, activo: true },
      { nivel: 'Primaria Completa', descripcion: 'Primaria completa (1º a 5º)', orden_nivel: 3, activo: true },
      { nivel: 'Bachillerato Incompleto', descripcion: 'Secundaria sin terminar (6º a 11º)', orden_nivel: 4, activo: true },
      { nivel: 'Bachillerato Completo', descripcion: 'Secundaria completa (6º a 11º)', orden_nivel: 5, activo: true },
      { nivel: 'Técnico', descripcion: 'Educación técnica profesional', orden_nivel: 6, activo: true },
      { nivel: 'Tecnológico', descripcion: 'Educación tecnológica', orden_nivel: 7, activo: true },
      { nivel: 'Universitario Incompleto', descripcion: 'Educación universitaria sin terminar', orden_nivel: 8, activo: true },
      { nivel: 'Universitario Completo', descripcion: 'Educación universitaria completa (Pregrado)', orden_nivel: 9, activo: true },
      { nivel: 'Especialización', descripcion: 'Posgrado - Especialización', orden_nivel: 10, activo: true },
      { nivel: 'Maestría', descripcion: 'Posgrado - Maestría', orden_nivel: 11, activo: true },
      { nivel: 'Doctorado', descripcion: 'Posgrado - Doctorado', orden_nivel: 12, activo: true },
      { nivel: 'Otro', descripcion: 'Otro tipo de educación', orden_nivel: 13, activo: true }
    ];

    for (const nivel of nivelesEducativos) {
      const [result] = await sequelize.query(`
        INSERT INTO niveles_educativos (nivel, descripcion, orden_nivel, activo, "createdAt", "updatedAt")
        VALUES (
          '${nivel.nivel.replace(/'/g, "''")}',
          '${nivel.descripcion.replace(/'/g, "''")}',
          ${nivel.orden_nivel},
          ${nivel.activo},
          NOW(),
          NOW()
        )
        RETURNING id_niveles_educativos, nivel, orden_nivel;
      `);
      console.log(`  ✅ ID ${String(result[0].id_niveles_educativos).padStart(2)} - Orden ${String(result[0].orden_nivel).padStart(2)}: ${result[0].nivel}`);
    }

    // Verificación
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [verificacion] = await sequelize.query(`
      SELECT id_niveles_educativos, nivel, orden_nivel, activo
      FROM niveles_educativos
      ORDER BY orden_nivel;
    `);

    console.log('┌────┬────────────────────────────┬───────┬────────┐');
    console.log('│ ID │ Nivel Educativo            │ Orden │ Activo │');
    console.log('├────┼────────────────────────────┼───────┼────────┤');
    
    verificacion.forEach(n => {
      const id = String(n.id_niveles_educativos).padStart(2, ' ');
      const nivel = n.nivel.padEnd(26, ' ');
      const orden = String(n.orden_nivel).padStart(5, ' ');
      const activo = n.activo ? '  Sí  ' : '  No  ';
      console.log(`│ ${id} │ ${nivel} │ ${orden} │ ${activo} │`);
    });
    
    console.log('└────┴────────────────────────────┴───────┴────────┘');
    console.log(`\n📊 Total de niveles educativos: ${verificacion.length}`);
    console.log('='.repeat(80));
    console.log('✅ NIVELES EDUCATIVOS INSERTADOS CORRECTAMENTE\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarNivelesEducativos();
