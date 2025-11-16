/**
 * Seeder para tabla situaciones_civiles en BASE DE DATOS LOCAL
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

const situacionesCiviles = [
  { id: 1, nombre: 'Soltero(a)' },
  { id: 2, nombre: 'Casado(a)' },
  { id: 3, nombre: 'Unión Libre' },
  { id: 4, nombre: 'Divorciado(a)' },
  { id: 5, nombre: 'Separado(a)' },
  { id: 6, nombre: 'Viudo(a)' },
  { id: 7, nombre: 'Unión Marital de Hecho' },
  { id: 8, nombre: 'Otro' }
];

async function seedSituacionesCiviles() {
  try {
    console.log('💑 SEEDER DE SITUACIONES CIVILES - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar primero
    console.log('🗑️  Limpiando tabla situaciones_civiles...');
    await sequelize.query('DELETE FROM situaciones_civiles;');
    await sequelize.query('ALTER SEQUENCE situaciones_civiles_id_situacion_civil_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar situaciones con IDs específicos
    console.log(`📝 Insertando ${situacionesCiviles.length} situaciones civiles...\n`);
    
    for (const situacion of situacionesCiviles) {
      await sequelize.query(`
        INSERT INTO situaciones_civiles (id_situacion_civil, nombre, "createdAt", "updatedAt")
        VALUES (:id, :nombre, NOW(), NOW());
      `, {
        replacements: { 
          id: situacion.id,
          nombre: situacion.nombre 
        }
      });
      console.log(`   ✓ ID ${situacion.id}: ${situacion.nombre}`);
    }

    // Ajustar la secuencia
    console.log('\n🔄 Ajustando secuencia...');
    await sequelize.query(`SELECT setval('situaciones_civiles_id_situacion_civil_seq', ${situacionesCiviles.length}, true);`);

    // Verificar
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT id_situacion_civil, nombre 
      FROM situaciones_civiles 
      ORDER BY id_situacion_civil;
    `);
    
    console.log('Situaciones civiles insertadas:');
    result.forEach(s => {
      console.log(`   ${s.id_situacion_civil}. ${s.nombre}`);
    });
    
    const [seq] = await sequelize.query('SELECT last_value FROM situaciones_civiles_id_situacion_civil_seq;');
    console.log(`\n🔢 Próximo ID disponible: ${parseInt(seq[0].last_value) + 1}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${situacionesCiviles.length} situaciones civiles con IDs 1-${situacionesCiviles.length}\n`);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedSituacionesCiviles();
