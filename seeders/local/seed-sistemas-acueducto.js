/**
 * Seeder para tabla sistemas_acueducto en BASE DE DATOS LOCAL
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

const sistemasAcueducto = [
  { id: 1, nombre: 'Acueducto Municipal' },
  { id: 2, nombre: 'Acueducto Comunal' },
  { id: 3, nombre: 'Pozo' },
  { id: 4, nombre: 'Río o Quebrada' },
  { id: 5, nombre: 'Agua Lluvia' },
  { id: 6, nombre: 'Otro' }
];

async function seedSistemasAcueducto() {
  try {
    console.log('💧 SEEDER DE SISTEMAS DE ACUEDUCTO - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar tablas relacionadas primero
    console.log('🗑️  Limpiando tablas relacionadas...');
    try {
      await sequelize.query('DELETE FROM familia_sistema_acueducto;');
      console.log('   ✓ familia_sistema_acueducto limpiada');
    } catch (e) {
      console.log('   ℹ️  familia_sistema_acueducto no existe o ya está vacía');
    }
    
    console.log('🗑️  Limpiando tabla sistemas_acueducto...');
    await sequelize.query('DELETE FROM sistemas_acueducto;');
    await sequelize.query('ALTER SEQUENCE sistemas_acueducto_id_sistema_acueducto_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar sistemas con IDs específicos
    console.log(`📝 Insertando ${sistemasAcueducto.length} sistemas de acueducto...\n`);
    
    for (const sistema of sistemasAcueducto) {
      await sequelize.query(`
        INSERT INTO sistemas_acueducto (id_sistema_acueducto, nombre, created_at, updated_at)
        VALUES (:id, :nombre, NOW(), NOW());
      `, {
        replacements: { 
          id: sistema.id,
          nombre: sistema.nombre 
        }
      });
      console.log(`   ✓ ID ${sistema.id}: ${sistema.nombre}`);
    }

    // Ajustar la secuencia
    console.log('\n🔄 Ajustando secuencia...');
    await sequelize.query(`SELECT setval('sistemas_acueducto_id_sistema_acueducto_seq', ${sistemasAcueducto.length}, true);`);

    // Verificar
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT id_sistema_acueducto, nombre 
      FROM sistemas_acueducto 
      ORDER BY id_sistema_acueducto;
    `);
    
    console.log('Sistemas de acueducto insertados:');
    result.forEach(s => {
      console.log(`   ${s.id_sistema_acueducto}. ${s.nombre}`);
    });
    
    const [seq] = await sequelize.query('SELECT last_value FROM sistemas_acueducto_id_sistema_acueducto_seq;');
    console.log(`\n🔢 Próximo ID disponible: ${parseInt(seq[0].last_value) + 1}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${sistemasAcueducto.length} sistemas de acueducto con IDs 1-${sistemasAcueducto.length}\n`);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedSistemasAcueducto();
