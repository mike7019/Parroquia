/**
 * Seeder para tabla tipos_identificacion en BASE DE DATOS LOCAL
 * Tipos de identificación válidos en Colombia
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

const tiposIdentificacion = [
  { id: 1, codigo: 'RC', nombre: 'Registro Civil', descripcion: 'Registro Civil de Nacimiento' },
  { id: 2, codigo: 'TI', nombre: 'Tarjeta de Identidad', descripcion: 'Tarjeta de Identidad para menores de 7 a 17 años' },
  { id: 3, codigo: 'CC', nombre: 'Cédula de Ciudadanía', descripcion: 'Cédula de Ciudadanía para mayores de 18 años' },
  { id: 4, codigo: 'CE', nombre: 'Cédula de Extranjería', descripcion: 'Documento de identificación para extranjeros residentes' },
  { id: 5, codigo: 'PAS', nombre: 'Pasaporte', descripcion: 'Pasaporte colombiano o extranjero' },
  { id: 6, codigo: 'PPT', nombre: 'Permiso por Protección Temporal', descripcion: 'PPT para migrantes venezolanos' },
  { id: 7, codigo: 'PEP', nombre: 'Permiso Especial de Permanencia', descripcion: 'PEP para migrantes venezolanos (anterior al PPT)' },
  { id: 8, codigo: 'SC', nombre: 'Salvoconducto', descripcion: 'Salvoconducto de permanencia' },
  { id: 9, codigo: 'NUIP', nombre: 'NUIP', descripcion: 'Número Único de Identificación Personal' }
];

async function seedTiposIdentificacion() {
  try {
    console.log('🪪  SEEDER DE TIPOS DE IDENTIFICACIÓN - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('📍 País: Colombia');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar primero
    console.log('🗑️  Limpiando tabla tipos_identificacion...');
    await sequelize.query('DELETE FROM tipos_identificacion;');
    await sequelize.query('ALTER SEQUENCE tipos_identificacion_id_tipo_identificacion_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar tipos con IDs específicos
    console.log(`📝 Insertando ${tiposIdentificacion.length} tipos de identificación...\n`);
    
    for (const tipo of tiposIdentificacion) {
      await sequelize.query(`
        INSERT INTO tipos_identificacion (id_tipo_identificacion, codigo, nombre, descripcion, created_at, updated_at)
        VALUES (:id, :codigo, :nombre, :descripcion, NOW(), NOW());
      `, {
        replacements: { 
          id: tipo.id,
          codigo: tipo.codigo,
          nombre: tipo.nombre,
          descripcion: tipo.descripcion
        }
      });
      console.log(`   ✓ ID ${tipo.id}: ${tipo.codigo} - ${tipo.nombre}`);
    }

    // Ajustar la secuencia
    console.log('\n🔄 Ajustando secuencia...');
    await sequelize.query(`SELECT setval('tipos_identificacion_id_tipo_identificacion_seq', ${tiposIdentificacion.length}, true);`);

    // Verificar
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT id_tipo_identificacion, codigo, nombre, descripcion
      FROM tipos_identificacion 
      ORDER BY id_tipo_identificacion;
    `);
    
    console.log('Tipos de identificación insertados:');
    result.forEach(t => {
      console.log(`   ${t.id_tipo_identificacion}. [${t.codigo}] ${t.nombre}`);
      console.log(`      ${t.descripcion}`);
    });
    
    const [seq] = await sequelize.query('SELECT last_value FROM tipos_identificacion_id_tipo_identificacion_seq;');
    console.log(`\n🔢 Próximo ID disponible: ${parseInt(seq[0].last_value) + 1}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${tiposIdentificacion.length} tipos de identificación válidos en Colombia`);
    console.log('📋 Incluye: RC, TI, CC, CE, Pasaporte, PPT, PEP, Salvoconducto, NUIP\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedTiposIdentificacion();
