/**
 * Seeder de destrezas y habilidades para BASE DE DATOS LOCAL
 * Base de datos: localhost:5432
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: false
});

const destrezas = [
  { id: 1, nombre: 'Carpintería' },
  { id: 2, nombre: 'Mecánica' },
  { id: 3, nombre: 'Electricidad' },
  { id: 4, nombre: 'Plomería' },
  { id: 5, nombre: 'Costura' },
  { id: 6, nombre: 'Tejido' },
  { id: 7, nombre: 'Artesanía' },
  { id: 8, nombre: 'Pintura' },
  { id: 9, nombre: 'Diseño Gráfico' },
  { id: 10, nombre: 'Fotografía' },
  { id: 11, nombre: 'Cocina' },
  { id: 12, nombre: 'Repostería' },
  { id: 13, nombre: 'Peluquería' },
  { id: 14, nombre: 'Barbería' },
  { id: 15, nombre: 'Belleza y Estética' },
  { id: 16, nombre: 'Manualidades' },
  { id: 17, nombre: 'Cerámica' },
  { id: 18, nombre: 'Jardinería' },
  { id: 19, nombre: 'Agricultura' },
  { id: 20, nombre: 'Ganadería' },
  { id: 21, nombre: 'Pesca' },
  { id: 22, nombre: 'Albañilería' },
  { id: 23, nombre: 'Soldadura' },
  { id: 24, nombre: 'Herrería' },
  { id: 25, nombre: 'Tapicería' },
  { id: 26, nombre: 'Ebanistería' },
  { id: 27, nombre: 'Zapatería' },
  { id: 28, nombre: 'Sastrería' },
  { id: 29, nombre: 'Bordado' },
  { id: 30, nombre: 'Bisutería' },
  { id: 31, nombre: 'Marroquinería' },
  { id: 32, nombre: 'Panadería' },
  { id: 33, nombre: 'Música' },
  { id: 34, nombre: 'Canto' },
  { id: 35, nombre: 'Danza' },
  { id: 36, nombre: 'Teatro' },
  { id: 37, nombre: 'Deportes' },
  { id: 38, nombre: 'Informática' },
  { id: 39, nombre: 'Reparación de Celulares' },
  { id: 40, nombre: 'Reparación de Electrodomésticos' },
  { id: 41, nombre: 'Conducción' },
  { id: 42, nombre: 'Operación de Maquinaria' },
  { id: 43, nombre: 'Masajes' },
  { id: 44, nombre: 'Primeros Auxilios' },
  { id: 45, nombre: 'Otra' }
];

const habilidades = [
  { id: 1, nombre: 'Carpintería' },
  { id: 2, nombre: 'Mecánica' },
  { id: 3, nombre: 'Electricidad' },
  { id: 4, nombre: 'Plomería' },
  { id: 5, nombre: 'Albañilería' },
  { id: 6, nombre: 'Soldadura' },
  { id: 7, nombre: 'Jardinería' },
  { id: 8, nombre: 'Mecánica Automotriz' },
  { id: 9, nombre: 'Programación' },
  { id: 10, nombre: 'Diseño Gráfico' },
  { id: 11, nombre: 'Fotografía' },
  { id: 12, nombre: 'Cocina' },
  { id: 13, nombre: 'Repostería' },
  { id: 14, nombre: 'Peluquería' },
  { id: 15, nombre: 'Costura' },
  { id: 16, nombre: 'Artesanía' },
  { id: 17, nombre: 'Música' },
  { id: 18, nombre: 'Deportes' },
  { id: 19, nombre: 'Agricultura' },
  { id: 20, nombre: 'Ganadería' }
];

async function seedDestrezasHabilidades() {
  try {
    console.log('💪 SEEDER DE DESTREZAS Y HABILIDADES - LOCAL');
    console.log('='.repeat(80));
    console.log('📍 Base de datos: localhost:5432');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado a base de datos LOCAL\n');

    // Limpiar tablas
    console.log('🧹 Limpiando tablas...');
    await sequelize.query('TRUNCATE TABLE destrezas RESTART IDENTITY CASCADE;');
    await sequelize.query('TRUNCATE TABLE habilidades RESTART IDENTITY CASCADE;');
    console.log('✅ Tablas limpiadas\n');

    // Insertar destrezas con IDs específicos
    console.log(`📝 Insertando ${destrezas.length} destrezas...\n`);
    
    for (const { id, nombre } of destrezas) {
      await sequelize.query(`
        INSERT INTO destrezas (id_destreza, nombre, "createdAt", "updatedAt")
        VALUES (:id, :nombre, NOW(), NOW());
      `, {
        replacements: { id, nombre }
      });
    }

    // Ajustar secuencia de destrezas
    await sequelize.query(`SELECT setval('destrezas_id_destreza_seq', 45, true);`);

    // Insertar habilidades con IDs específicos
    console.log(`📝 Insertando ${habilidades.length} habilidades...\n`);
    
    for (const { id, nombre } of habilidades) {
      await sequelize.query(`
        INSERT INTO habilidades (id_habilidad, nombre, descripcion, created_at, updated_at)
        VALUES (:id, :nombre, :descripcion, NOW(), NOW());
      `, {
        replacements: { 
          id,
          nombre,
          descripcion: `Habilidad en ${nombre}`
        }
      });
    }

    // Ajustar secuencia de habilidades
    await sequelize.query(`SELECT setval('habilidades_id_habilidad_seq', 20, true);`);

    // Verificar
    const [destResult] = await sequelize.query('SELECT COUNT(*) as count FROM destrezas;');
    const totalDest = parseInt(destResult[0].count);
    
    const [habResult] = await sequelize.query('SELECT COUNT(*) as count FROM habilidades;');
    const totalHab = parseInt(habResult[0].count);

    // Verificar IDs
    const [destIds] = await sequelize.query('SELECT MIN(id_destreza) as min, MAX(id_destreza) as max FROM destrezas;');
    const [habIds] = await sequelize.query('SELECT MIN(id_habilidad) as min, MAX(id_habilidad) as max FROM habilidades;');

    console.log('='.repeat(80));
    console.log('✅ RESULTADO FINAL');
    console.log('='.repeat(80));
    console.log(`📊 Total de destrezas: ${totalDest}`);
    console.log(`   └─ IDs del ${destIds[0].min} al ${destIds[0].max}`);
    console.log(`📊 Total de habilidades: ${totalHab}`);
    console.log(`   └─ IDs del ${habIds[0].min} al ${habIds[0].max}`);
    console.log('='.repeat(80));
    console.log('✅ Seeder ejecutado exitosamente');
    console.log('='.repeat(80));

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedDestrezasHabilidades();
