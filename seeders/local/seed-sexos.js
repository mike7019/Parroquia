/**
 * Seeder para tabla sexos en BASE DE DATOS LOCAL
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

const sexos = [
  { id: 1, nombre: 'Masculino' },
  { id: 2, nombre: 'Femenino' },
  { id: 3, nombre: 'Otro' }
];

async function seedSexos() {
  try {
    console.log('⚧️  SEEDER DE SEXOS - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar primero
    console.log('🗑️  Limpiando tabla sexos...');
    await sequelize.query('DELETE FROM sexos;');
    await sequelize.query('ALTER SEQUENCE sexos_id_sexo_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar sexos con IDs específicos
    console.log(`📝 Insertando ${sexos.length} sexos con IDs específicos...\n`);
    
    for (const sexo of sexos) {
      await sequelize.query(`
        INSERT INTO sexos (id_sexo, nombre, created_at, updated_at)
        VALUES (:id, :nombre, NOW(), NOW());
      `, {
        replacements: { 
          id: sexo.id,
          nombre: sexo.nombre 
        }
      });
      console.log(`   ✓ ID ${sexo.id}: ${sexo.nombre}`);
    }

    // Ajustar la secuencia para que continue desde 4
    console.log('\n🔄 Ajustando secuencia para continuar desde ID 4...');
    await sequelize.query('SELECT setval(\'sexos_id_sexo_seq\', 3, true);');

    // Verificar
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT id_sexo, nombre 
      FROM sexos 
      ORDER BY id_sexo;
    `);
    
    console.log('Sexos insertados:');
    result.forEach(s => {
      console.log(`   ${s.id_sexo}. ${s.nombre}`);
    });
    
    const [seq] = await sequelize.query('SELECT last_value FROM sexos_id_sexo_seq;');
    console.log(`\n🔢 Próximo ID disponible: ${parseInt(seq[0].last_value) + 1}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${sexos.length} sexos con IDs 1-${sexos.length}\n`);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedSexos();
