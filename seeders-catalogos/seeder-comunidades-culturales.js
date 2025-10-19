/**
 * Seeder para Comunidades Culturales - Base de Datos Remota
 * Incluye comunidades étnicas y culturales de Colombia
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

async function insertarComunidadesCulturales() {
  try {
    console.log('🌍 INSERTANDO COMUNIDADES CULTURALES');
    console.log('='.repeat(80));
    console.log('📍 Host: 206.62.139.100:5433');
    console.log('📦 Tabla: comunidades_culturales\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Limpiar datos existentes
    await sequelize.query('DELETE FROM comunidades_culturales;');
    await sequelize.query('ALTER SEQUENCE comunidades_culturales_id_comunidad_cultural_seq RESTART WITH 1;');
    console.log('🗑️  Tabla limpiada y secuencia reseteada\n');

    console.log('📝 Insertando comunidades culturales...\n');

    const comunidades = [
      // Comunidades indígenas principales
      {
        nombre: 'Indígena',
        descripcion: 'Pueblos indígenas originarios de Colombia (Wayúu, Nasa, Zenú, Embera, etc.)',
        activo: true
      },
      {
        nombre: 'Wayúu',
        descripcion: 'Comunidad indígena de La Guajira',
        activo: true
      },
      {
        nombre: 'Nasa',
        descripcion: 'Comunidad indígena del Cauca',
        activo: true
      },
      {
        nombre: 'Zenú',
        descripcion: 'Comunidad indígena de Córdoba y Sucre',
        activo: true
      },
      {
        nombre: 'Embera',
        descripcion: 'Comunidad indígena del Chocó y zonas andinas',
        activo: true
      },
      {
        nombre: 'Arhuaco',
        descripcion: 'Comunidad indígena de la Sierra Nevada de Santa Marta',
        activo: true
      },
      {
        nombre: 'Kogui',
        descripcion: 'Comunidad indígena de la Sierra Nevada de Santa Marta',
        activo: true
      },
      {
        nombre: 'Wiwa',
        descripcion: 'Comunidad indígena de la Sierra Nevada de Santa Marta',
        activo: true
      },
      
      // Comunidades afrodescendientes
      {
        nombre: 'Afrocolombiano',
        descripcion: 'Comunidad afrodescendiente',
        activo: true
      },
      {
        nombre: 'Raizal',
        descripcion: 'Comunidad raizal del Archipiélago de San Andrés, Providencia y Santa Catalina',
        activo: true
      },
      {
        nombre: 'Palenquero',
        descripcion: 'Comunidad de San Basilio de Palenque',
        activo: true
      },
      
      // Comunidades ROM
      {
        nombre: 'Rom (Gitano)',
        descripcion: 'Pueblo Rom o Gitano',
        activo: true
      },
      
      // Comunidades campesinas
      {
        nombre: 'Campesino',
        descripcion: 'Comunidad campesina',
        activo: true
      },
      
      // Mestizos y otros
      {
        nombre: 'Mestizo',
        descripcion: 'Población mestiza (mezcla de etnias)',
        activo: true
      },
      {
        nombre: 'Blanco/Caucásico',
        descripcion: 'Población de origen europeo',
        activo: true
      },
      
      // Comunidades migrantes
      {
        nombre: 'Migrante/Extranjero',
        descripcion: 'Persona de otra nacionalidad o comunidad migrante',
        activo: true
      },
      
      // Opción neutral
      {
        nombre: 'No especifica',
        descripcion: 'No desea especificar su comunidad cultural',
        activo: true
      },
      {
        nombre: 'Ninguna',
        descripcion: 'No se identifica con ninguna comunidad cultural específica',
        activo: true
      }
    ];

    for (const comunidad of comunidades) {
      const [result] = await sequelize.query(`
        INSERT INTO comunidades_culturales (nombre, descripcion, activo, "createdAt", "updatedAt")
        VALUES (
          '${comunidad.nombre.replace(/'/g, "''")}',
          '${comunidad.descripcion.replace(/'/g, "''")}',
          ${comunidad.activo},
          NOW(),
          NOW()
        )
        RETURNING id_comunidad_cultural, nombre;
      `);
      console.log(`  ✅ ID ${String(result[0].id_comunidad_cultural).padStart(2)}: ${result[0].nombre}`);
    }

    // Verificación final
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICACIÓN FINAL:\n');
    
    const [verificacion] = await sequelize.query(`
      SELECT id_comunidad_cultural, nombre, descripcion, activo
      FROM comunidades_culturales
      ORDER BY id_comunidad_cultural;
    `);

    console.log('📋 Comunidades culturales en la base de datos:\n');
    
    // Agrupar por categoría
    const indigenas = verificacion.filter(c => 
      c.nombre.includes('Indígena') || 
      ['Wayúu', 'Nasa', 'Zenú', 'Embera', 'Arhuaco', 'Kogui', 'Wiwa'].includes(c.nombre)
    );
    const afro = verificacion.filter(c => 
      ['Afrocolombiano', 'Raizal', 'Palenquero'].includes(c.nombre)
    );
    const otros = verificacion.filter(c => 
      !indigenas.includes(c) && !afro.includes(c)
    );

    console.log('🏛️  COMUNIDADES INDÍGENAS:');
    indigenas.forEach(c => console.log(`   • ID ${String(c.id_comunidad_cultural).padStart(2)}: ${c.nombre}`));
    
    console.log('\n🎭 COMUNIDADES AFRODESCENDIENTES:');
    afro.forEach(c => console.log(`   • ID ${String(c.id_comunidad_cultural).padStart(2)}: ${c.nombre}`));
    
    console.log('\n🌎 OTRAS COMUNIDADES:');
    otros.forEach(c => console.log(`   • ID ${String(c.id_comunidad_cultural).padStart(2)}: ${c.nombre}`));

    console.log(`\n📊 Total de comunidades culturales: ${verificacion.length}`);
    console.log('='.repeat(80));
    console.log('✅ COMUNIDADES CULTURALES INSERTADAS CORRECTAMENTE\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles:', error.original);
    }
    process.exit(1);
  }
}

insertarComunidadesCulturales();
