/**
 * Seeder para TIPOS DE VIVIENDA - Servidor Remoto
 *
 * ⚠️ DEPRECADO: esta tabla ya la siembra de forma segura e idempotente
 * `src/seeders/configSeeder.js` (seedTiposVivienda), que se ejecuta vía
 * `npm run db:seed` respetando NODE_ENV/.env. Este script queda solo como
 * herramienta manual de emergencia para el servidor remoto.
 *
 * Reparado: la tabla real es "tipos_vivienda" (sin "s") con columna
 * "id_tipo_vivienda" y "nombre"/"descripcion" — el script original apuntaba
 * a una tabla "tipos_viviendas" inexistente y además borraba todo el
 * contenido de la tabla antes de insertar. Ahora es idempotente (no borra
 * nada, solo inserta lo que falte).
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

async function insertarTiposVivienda() {
  try {
    console.log('🏠 SEMBRANDO TIPOS DE VIVIENDA - SERVIDOR REMOTO');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433\n');

    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    const [{ count }] = (await sequelize.query('SELECT COUNT(*) as count FROM tipos_vivienda'))[0];
    if (parseInt(count) > 0) {
      console.log(`ℹ️  tipos_vivienda ya tiene ${count} registros, no se inserta nada.`);
      await sequelize.close();
      return;
    }

    const tiposVivienda = ['Casa', 'Apartamento', 'Rancho/Finca', 'Cuarto', 'Inquilinato', 'Otro'];

    for (const nombre of tiposVivienda) {
      const [result] = await sequelize.query(`
        INSERT INTO tipos_vivienda (nombre, descripcion, created_at, updated_at)
        VALUES (:nombre, :nombre, NOW(), NOW())
        RETURNING id_tipo_vivienda, nombre;
      `, { replacements: { nombre } });

      console.log(`  ✅ ID ${result[0].id_tipo_vivienda} - ${result[0].nombre}`);
    }

    console.log('\n✅ TIPOS DE VIVIENDA INSERTADOS CORRECTAMENTE');
    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('seeder-tipos-viviendas-remoto.js');
if (isMainModule) {
  insertarTiposVivienda();
}

export default insertarTiposVivienda;
