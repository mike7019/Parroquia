/**
 * Seeder para tabla tallas en BASE DE DATOS LOCAL
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

const tallas = [
  // Tallas de camisetas/camisas
  { id: 1, tipo_prenda: 'Camiseta', talla: 'XXS', descripcion: 'Extra Extra Pequeña', genero: 'unisex' },
  { id: 2, tipo_prenda: 'Camiseta', talla: 'XS', descripcion: 'Extra Pequeña', genero: 'unisex' },
  { id: 3, tipo_prenda: 'Camiseta', talla: 'S', descripcion: 'Pequeña', genero: 'unisex' },
  { id: 4, tipo_prenda: 'Camiseta', talla: 'M', descripcion: 'Mediana', genero: 'unisex' },
  { id: 5, tipo_prenda: 'Camiseta', talla: 'L', descripcion: 'Grande', genero: 'unisex' },
  { id: 6, tipo_prenda: 'Camiseta', talla: 'XL', descripcion: 'Extra Grande', genero: 'unisex' },
  { id: 7, tipo_prenda: 'Camiseta', talla: 'XXL', descripcion: 'Extra Extra Grande', genero: 'unisex' },
  { id: 8, tipo_prenda: 'Camiseta', talla: 'XXXL', descripcion: 'Extra Extra Extra Grande', genero: 'unisex' },
  
  // Tallas de pantalón
  { id: 9, tipo_prenda: 'Pantalón', talla: '28', descripcion: 'Talla 28', genero: 'unisex', equivalencia_numerica: 28 },
  { id: 10, tipo_prenda: 'Pantalón', talla: '30', descripcion: 'Talla 30', genero: 'unisex', equivalencia_numerica: 30 },
  { id: 11, tipo_prenda: 'Pantalón', talla: '32', descripcion: 'Talla 32', genero: 'unisex', equivalencia_numerica: 32 },
  { id: 12, tipo_prenda: 'Pantalón', talla: '34', descripcion: 'Talla 34', genero: 'unisex', equivalencia_numerica: 34 },
  { id: 13, tipo_prenda: 'Pantalón', talla: '36', descripcion: 'Talla 36', genero: 'unisex', equivalencia_numerica: 36 },
  { id: 14, tipo_prenda: 'Pantalón', talla: '38', descripcion: 'Talla 38', genero: 'unisex', equivalencia_numerica: 38 },
  
  // Tallas de calzado
  { id: 15, tipo_prenda: 'Calzado', talla: '35', descripcion: 'Talla 35', genero: 'unisex', equivalencia_numerica: 35 },
  { id: 16, tipo_prenda: 'Calzado', talla: '36', descripcion: 'Talla 36', genero: 'unisex', equivalencia_numerica: 36 },
  { id: 17, tipo_prenda: 'Calzado', talla: '37', descripcion: 'Talla 37', genero: 'unisex', equivalencia_numerica: 37 },
  { id: 18, tipo_prenda: 'Calzado', talla: '38', descripcion: 'Talla 38', genero: 'unisex', equivalencia_numerica: 38 },
  { id: 19, tipo_prenda: 'Calzado', talla: '39', descripcion: 'Talla 39', genero: 'unisex', equivalencia_numerica: 39 },
  { id: 20, tipo_prenda: 'Calzado', talla: '40', descripcion: 'Talla 40', genero: 'unisex', equivalencia_numerica: 40 },
  { id: 21, tipo_prenda: 'Calzado', talla: '41', descripcion: 'Talla 41', genero: 'unisex', equivalencia_numerica: 41 },
  { id: 22, tipo_prenda: 'Calzado', talla: '42', descripcion: 'Talla 42', genero: 'unisex', equivalencia_numerica: 42 },
  
  // Tallas genéricas
  { id: 23, tipo_prenda: 'General', talla: 'Única', descripcion: 'Talla única', genero: 'unisex' },
  { id: 24, tipo_prenda: 'General', talla: 'No especificada', descripcion: 'Sin talla específica', genero: 'unisex' }
];

async function seedTallas() {
  try {
    console.log('👕 SEEDER DE TALLAS - BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('🖥️  Servidor: localhost:5432');
    console.log('='.repeat(80));
    console.log('\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar primero
    console.log('🗑️  Limpiando tabla tallas...');
    await sequelize.query('DELETE FROM tallas;');
    await sequelize.query('ALTER SEQUENCE tallas_id_talla_seq RESTART WITH 1;');
    console.log('✅ Tabla limpiada y secuencia reseteada\n');

    // Insertar tallas con IDs específicos
    console.log(`📝 Insertando ${tallas.length} tallas...\n`);
    
    for (const talla of tallas) {
      const equivalenciaNumerica = talla.equivalencia_numerica || null;
      
      await sequelize.query(`
        INSERT INTO tallas (id_talla, tipo_prenda, talla, descripcion, genero, equivalencia_numerica, activo, created_at, updated_at)
        VALUES (:id, :tipo_prenda, :talla, :descripcion, :genero, :equivalencia_numerica, true, NOW(), NOW());
      `, {
        replacements: { 
          id: talla.id,
          tipo_prenda: talla.tipo_prenda,
          talla: talla.talla,
          descripcion: talla.descripcion,
          genero: talla.genero,
          equivalencia_numerica: equivalenciaNumerica
        }
      });
      
      if (talla.id % 5 === 0) {
        console.log(`   ✓ ${talla.id} tallas insertadas...`);
      }
    }
    console.log(`   ✓ ${tallas.length} tallas insertadas\n`);

    // Ajustar la secuencia
    console.log('🔄 Ajustando secuencia...');
    await sequelize.query(`SELECT setval('tallas_id_talla_seq', ${tallas.length}, true);`);

    // Verificar
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [result] = await sequelize.query(`
      SELECT id_talla, tipo_prenda, talla, genero
      FROM tallas 
      ORDER BY id_talla;
    `);
    
    console.log('Todas las tallas insertadas:');
    result.forEach(t => {
      console.log(`   ${t.id_talla}. ${t.tipo_prenda} - Talla ${t.talla} (${t.genero})`);
    });
    
    const [seq] = await sequelize.query('SELECT last_value FROM tallas_id_talla_seq;');
    console.log(`\n🔢 Próximo ID disponible: ${parseInt(seq[0].last_value) + 1}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEEDER COMPLETADO EXITOSAMENTE!');
    console.log(`✅ ${tallas.length} tallas con IDs 1-${tallas.length}\n`);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

seedTallas();
