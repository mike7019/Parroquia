/**
 * Seeder para TIPOS DE VIVIENDAS - Servidor Remoto
 * Soluciona: Foreign key constraint error en tabla familias
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

async function insertarTiposViviendas() {
  try {
    console.log('🏠 INSERTANDO TIPOS DE VIVIENDAS - SERVIDOR REMOTO');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433');
    console.log('🎯 Solución para: "Key (id_tipo_vivienda)=(1) is not present"\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar y reiniciar
    await sequelize.query('DELETE FROM tipos_viviendas;');
    await sequelize.query('ALTER SEQUENCE tipos_viviendas_id_tipo_seq RESTART WITH 1;');
    console.log('🗑️  Tabla limpiada\n');

    console.log('📝 Insertando tipos de vivienda...\n');

    const tiposVivienda = [
      { descripcion: 'Casa', activo: true },
      { descripcion: 'Apartamento', activo: true },
      { descripcion: 'Rancho/Finca', activo: true },
      { descripcion: 'Cuarto', activo: true },
      { descripcion: 'Inquilinato', activo: true },
      { descripcion: 'Otro', activo: true }
    ];

    for (const tipo of tiposVivienda) {
      const [result] = await sequelize.query(`
        INSERT INTO tipos_viviendas (descripcion, activo, created_at, updated_at)
        VALUES (
          '${tipo.descripcion}',
          ${tipo.activo},
          NOW(),
          NOW()
        )
        RETURNING id_tipo, descripcion, activo;
      `);
      
      console.log(`  ✅ ID ${result[0].id_tipo} - ${result[0].descripcion} (activo: ${result[0].activo})`);
    }

    // Verificación
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [verificacion] = await sequelize.query(`
      SELECT id_tipo, descripcion, activo
      FROM tipos_viviendas
      ORDER BY id_tipo;
    `);

    console.log('┌────┬─────────────────────┬────────┐');
    console.log('│ ID │ Tipo de Vivienda    │ Activo │');
    console.log('├────┼─────────────────────┼────────┤');
    
    verificacion.forEach(t => {
      const id = String(t.id_tipo).padStart(2, ' ');
      const desc = t.descripcion.padEnd(19, ' ');
      const activo = t.activo ? '  Sí  ' : '  No  ';
      console.log(`│ ${id} │ ${desc} │ ${activo} │`);
    });
    
    console.log('└────┴─────────────────────┴────────┘');
    console.log(`\n📊 Total de tipos de vivienda: ${verificacion.length}`);
    console.log('='.repeat(80));
    console.log('✅ TIPOS DE VIVIENDA INSERTADOS CORRECTAMENTE');
    console.log('\n💡 Ahora puedes crear encuestas con id_tipo_vivienda del 1 al 6\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarTiposViviendas();
