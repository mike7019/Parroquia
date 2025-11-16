/**
 * Seeder para la tabla SITUACIONES_CIVILES (la que usa el API)
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

async function insertarSituacionesCiviles() {
  try {
    console.log('💍 INSERTANDO SITUACIONES CIVILES');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433');
    console.log('📦 Tabla: situaciones_civiles\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar datos existentes
    await sequelize.query('DELETE FROM situaciones_civiles;');
    await sequelize.query('ALTER SEQUENCE situaciones_civiles_id_situacion_civil_seq RESTART WITH 1;');
    console.log('🗑️  Tabla limpiada y secuencia reseteada\n');

    console.log('📝 Insertando situaciones civiles...\n');

    const situacionesCiviles = [
      { nombre: 'Soltero(a)', descripcion: 'Persona que no ha contraído matrimonio', codigo: 'SOL', orden: 1, activo: true },
      { nombre: 'Casado(a)', descripcion: 'Persona unida en matrimonio civil o religioso', codigo: 'CAS', orden: 2, activo: true },
      { nombre: 'Divorciado(a)', descripcion: 'Persona que ha disuelto su matrimonio', codigo: 'DIV', orden: 3, activo: true },
      { nombre: 'Viudo(a)', descripcion: 'Persona cuyo cónyuge ha fallecido', codigo: 'VIU', orden: 4, activo: true },
      { nombre: 'Unión Libre', descripcion: 'Persona que vive en unión marital de hecho', codigo: 'UNL', orden: 5, activo: true },
      { nombre: 'Separado(a)', descripcion: 'Persona separada de su cónyuge', codigo: 'SEP', orden: 6, activo: true },
      { nombre: 'Religioso(a)', descripcion: 'Persona consagrada (sacerdote, monja, etc.)', codigo: 'REL', orden: 7, activo: true },
      { nombre: 'No especifica', descripcion: 'No desea especificar su estado civil', codigo: 'NE', orden: 8, activo: true }
    ];

    for (const situacion of situacionesCiviles) {
      const [result] = await sequelize.query(`
        INSERT INTO situaciones_civiles (nombre, descripcion, codigo, orden, activo, "createdAt", "updatedAt")
        VALUES (
          '${situacion.nombre}',
          '${situacion.descripcion}',
          '${situacion.codigo}',
          ${situacion.orden},
          ${situacion.activo},
          NOW(),
          NOW()
        )
        RETURNING id_situacion_civil, nombre, codigo;
      `);
      console.log(`  ✅ ID ${result[0].id_situacion_civil}: ${result[0].nombre} (${result[0].codigo})`);
    }

    // Verificación final
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [verificacion] = await sequelize.query(`
      SELECT id_situacion_civil, nombre, codigo, orden, activo
      FROM situaciones_civiles
      ORDER BY orden;
    `);

    console.log('┌────┬──────────────────────┬────────┬───────┬────────┐');
    console.log('│ ID │ Nombre               │ Código │ Orden │ Activo │');
    console.log('├────┼──────────────────────┼────────┼───────┼────────┤');
    
    verificacion.forEach(s => {
      const id = String(s.id_situacion_civil).padStart(2, ' ');
      const nombre = s.nombre.padEnd(20, ' ');
      const codigo = s.codigo.padEnd(6, ' ');
      const orden = String(s.orden).padStart(5, ' ');
      const activo = s.activo ? '  Sí  ' : '  No  ';
      console.log(`│ ${id} │ ${nombre} │ ${codigo} │ ${orden} │ ${activo} │`);
    });
    
    console.log('└────┴──────────────────────┴────────┴───────┴────────┘');
    console.log(`\n📊 Total de situaciones civiles: ${verificacion.length}`);
    console.log('='.repeat(80));
    console.log('✅ SITUACIONES CIVILES INSERTADAS CORRECTAMENTE');
    console.log('\n💡 Ahora el API debería funcionar correctamente:');
    console.log('   http://206.62.139.100:3001/api/catalog/situaciones-civiles\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarSituacionesCiviles();
