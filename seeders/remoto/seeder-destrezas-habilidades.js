/**
 * Seeder de destrezas y habilidades
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

const destrezas = [
  'Carpintería',
  'Mecánica',
  'Electricidad',
  'Plomería',
  'Costura',
  'Tejido',
  'Artesanía',
  'Pintura',
  'Diseño Gráfico',
  'Fotografía',
  'Cocina',
  'Repostería',
  'Peluquería',
  'Barbería',
  'Belleza y Estética',
  'Manualidades',
  'Cerámica',
  'Jardinería',
  'Agricultura',
  'Ganadería',
  'Pesca',
  'Albañilería',
  'Soldadura',
  'Herrería',
  'Tapicería',
  'Ebanistería',
  'Zapatería',
  'Sastrería',
  'Bordado',
  'Bisutería',
  'Marroquinería',
  'Panadería',
  'Música',
  'Canto',
  'Danza',
  'Teatro',
  'Deportes',
  'Informática',
  'Reparación de Celulares',
  'Reparación de Electrodomésticos',
  'Conducción',
  'Operación de Maquinaria',
  'Masajes',
  'Primeros Auxilios',
  'Otra'
];

const habilidades = [
  'Carpintería',
  'Mecánica',
  'Electricidad',
  'Plomería',
  'Albañilería',
  'Soldadura',
  'Jardinería',
  'Mecánica Automotriz',
  'Programación',
  'Diseño Gráfico',
  'Fotografía',
  'Cocina',
  'Repostería',
  'Peluquería',
  'Costura',
  'Artesanía',
  'Música',
  'Deportes',
  'Agricultura',
  'Ganadería'
];

async function seedDestrezasHabilidades() {
  try {
    console.log('💪 SEEDER DE DESTREZAS Y HABILIDADES');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Insertar destrezas
    console.log(`📝 Insertando ${destrezas.length} destrezas...\n`);
    
    for (const nombre of destrezas) {
      await sequelize.query(`
        INSERT INTO destrezas (nombre, "createdAt", "updatedAt")
        VALUES (:nombre, NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING;
      `, {
        replacements: { nombre }
      });
    }

    // Insertar habilidades
    console.log(`📝 Insertando ${habilidades.length} habilidades...\n`);
    
    for (const nombre of habilidades) {
      await sequelize.query(`
        INSERT INTO habilidades (nombre, descripcion, created_at, updated_at)
        VALUES (:nombre, :descripcion, NOW(), NOW())
        ON CONFLICT (nombre) DO NOTHING;
      `, {
        replacements: { 
          nombre,
          descripcion: `Habilidad en ${nombre}`
        }
      });
    }

    // Verificar
    const [destResult] = await sequelize.query('SELECT COUNT(*) as count FROM destrezas;');
    const totalDest = parseInt(destResult[0].count);
    
    const [habResult] = await sequelize.query('SELECT COUNT(*) as count FROM habilidades;');
    const totalHab = parseInt(habResult[0].count);

    console.log('='.repeat(80));
    console.log(`✅ Total de destrezas en BD: ${totalDest}`);
    console.log(`✅ Total de habilidades en BD: ${totalHab}`);
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
