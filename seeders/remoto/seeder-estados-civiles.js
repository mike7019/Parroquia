/**
 * Seeder de Estados Civiles para Base de Datos Remota
 * Inserta o actualiza los estados civiles necesarios
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

async function insertarEstadosCiviles() {
  try {
    console.log('💍 SEEDER DE ESTADOS CIVILES');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433');
    console.log('📦 Database: parroquia_db\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Verificar estados civiles existentes
    const [existentes] = await sequelize.query(`
      SELECT id_estado, descripcion, activo FROM estados_civiles ORDER BY id_estado;
    `);

    console.log('📋 Estados civiles actuales:');
    existentes.forEach(e => {
      const icono = e.activo ? '✅' : '❌';
      console.log(`  ${icono} ID ${e.id_estado}: ${e.descripcion}`);
    });

    console.log(`\n📊 Total actual: ${existentes.length} registros\n`);

    // Estados civiles completos que deberían existir
    const estadosCiviles = [
      { descripcion: 'Soltero(a)', activo: true },
      { descripcion: 'Casado(a)', activo: true },
      { descripcion: 'Divorciado(a)', activo: true },
      { descripcion: 'Viudo(a)', activo: true },
      { descripcion: 'Unión Libre', activo: true },
      { descripcion: 'Separado(a)', activo: true },
      { descripcion: 'Religioso(a)', activo: true }, // Nuevo - persona consagrada
      { descripcion: 'No especifica', activo: true } // Nuevo - no desea especificar
    ];

    // Obtener descripciones existentes
    const descripcionesExistentes = existentes.map(e => e.descripcion);

    // Filtrar solo los que faltan
    const estadosNuevos = estadosCiviles.filter(
      ec => !descripcionesExistentes.includes(ec.descripcion)
    );

    if (estadosNuevos.length === 0) {
      console.log('✅ Todos los estados civiles ya están en la base de datos');
      console.log('ℹ️  No hay nada que insertar\n');
    } else {
      console.log(`📝 Insertando ${estadosNuevos.length} estados civiles nuevos...\n`);

      for (const estado of estadosNuevos) {
        await sequelize.query(`
          INSERT INTO estados_civiles (descripcion, activo, created_at, updated_at)
          VALUES ('${estado.descripcion}', ${estado.activo}, NOW(), NOW());
        `);
        console.log(`  ✅ Insertado: ${estado.descripcion}`);
      }
    }

    // Verificar el resultado final
    console.log('\n' + '='.repeat(80));
    console.log('📊 ESTADO FINAL:\n');
    
    const [finales] = await sequelize.query(`
      SELECT id_estado, descripcion, activo 
      FROM estados_civiles 
      ORDER BY id_estado;
    `);

    finales.forEach(e => {
      const icono = e.activo ? '✅' : '❌';
      console.log(`  ${icono} ID ${String(e.id_estado).padStart(2)}: ${e.descripcion}`);
    });

    console.log(`\n📊 Total de estados civiles: ${finales.length}`);
    console.log('='.repeat(80));
    console.log('✅ SEEDER COMPLETADO\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarEstadosCiviles();
