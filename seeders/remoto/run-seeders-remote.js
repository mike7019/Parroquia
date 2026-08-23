/**
 * Script para ejecutar los seeders de catálogo en la base de datos remota
 * (206.62.139.100:5433). Llena los catálogos necesarios para el
 * funcionamiento del sistema.
 *
 * Reparado: la versión original listaba 10 archivos ".cjs" que nunca
 * existieron en el repositorio (ej. "20240101000001-tipos-identificacion.cjs"),
 * por lo que nunca insertaba nada. Además, al vivir en la raíz de
 * `seeders/` (el `seeders-path` que sequelize-cli escanea para
 * `db:seed:all`), su código de nivel superior se auto-ejecutaba y se
 * conectaba a producción con estas credenciales apenas alguien corría ese
 * comando genérico — sin insertar nada, pero era una trampa. Ahora vive en
 * `seeders/remoto/` (fuera de ese escaneo), requiere ejecución explícita, y
 * reutiliza los seeders reales y probados de `src/seeders/advancedSeeder.js`
 * en vez de archivos inexistentes.
 *
 * Uso: node seeders/remoto/run-seeders-remote.js
 */

import { Sequelize } from 'sequelize';

const HOST = '206.62.139.100';
const PORT = 5433;
const DATABASE = 'parroquia_db';

const sequelizeRemoto = new Sequelize({
  dialect: 'postgres',
  host: HOST,
  port: PORT,
  database: DATABASE,
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

async function ejecutarTodosSeeders() {
  console.log('🌱 EJECUCIÓN DE SEEDERS DE CATÁLOGO EN BASE DE DATOS REMOTA');
  console.log('='.repeat(80));
  console.log(`📍 Host: ${HOST}:${PORT}`);
  console.log(`📦 Database: ${DATABASE}\n`);

  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelizeRemoto.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Los seeders (configSeeder, profesionesSeeder, tallasSeeder,
    // catalogosAdicionalesSeeder) importan su propia conexión desde
    // config/sequelize.js, así que apuntamos esa conexión compartida a esta
    // BD remota antes de invocarlos, en vez de duplicar su lógica aquí.
    process.env.DB_HOST = HOST;
    process.env.DB_PORT = String(PORT);
    process.env.DB_NAME = DATABASE;
    const { runAllSeeders } = await import('../../src/seeders/advancedSeeder.js');

    const resultados = await runAllSeeders();

    console.log('\n' + '='.repeat(80));
    console.log(resultados.errores.length === 0 ? '✅ PROCESO COMPLETADO SIN ERRORES' : '⚠️  PROCESO COMPLETADO CON ERRORES');
    console.log('='.repeat(80));

    await sequelizeRemoto.close();
    process.exit(resultados.errores.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('run-seeders-remote.js');
if (isMainModule) {
  ejecutarTodosSeeders();
}

export default ejecutarTodosSeeders;
