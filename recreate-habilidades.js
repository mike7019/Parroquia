/**
 * Script para eliminar y recrear la tabla habilidades
 */

import sequelize from './config/sequelize.js';
import Habilidad from './src/models/catalog/Habilidad.js';

async function recreateHabilidades() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     RECREAR TABLA HABILIDADES (DROP + CREATE)              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa\n');

    // Eliminar tabla si existe
    console.log('2. Eliminando tabla anterior si existe...');
    await sequelize.query('DROP TABLE IF EXISTS habilidades CASCADE;');
    console.log('   ✅ Tabla eliminada\n');

    // Crear tabla nueva
    console.log('3. Creando tabla habilidades con estructura completa...');
    await Habilidad.sync({ force: true });
    console.log('   ✅ Tabla creada exitosamente\n');

    // Verificar estructura
    console.log('4. Verificando estructura de la tabla...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'habilidades'
      ORDER BY ordinal_position;
    `);

    console.log('   Columnas creadas:');
    results.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`   - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable}${defaultVal}`);
    });

    // Insertar datos de ejemplo
    console.log('\n5. Insertando datos de ejemplo...');
    const habilidadesEjemplo = [
      {
        nombre: 'Carpintería',
        descripcion: 'Habilidad para trabajar con madera y crear muebles',
        categoria: 'Oficios',
        activo: true
      },
      {
        nombre: 'Costura',
        descripcion: 'Habilidad para confeccionar prendas de vestir',
        categoria: 'Oficios',
        activo: true
      },
      {
        nombre: 'Cocina',
        descripcion: 'Habilidad culinaria y preparación de alimentos',
        categoria: 'Servicios',
        activo: true
      },
      {
        nombre: 'Electricidad',
        descripcion: 'Conocimientos en instalaciones eléctricas',
        categoria: 'Oficios',
        activo: true
      },
      {
        nombre: 'Plomería',
        descripcion: 'Instalación y reparación de sistemas de agua',
        categoria: 'Oficios',
        activo: true
      },
      {
        nombre: 'Agricultura',
        descripcion: 'Conocimientos en cultivo y producción agrícola',
        categoria: 'Campo',
        activo: true
      },
      {
        nombre: 'Panadería',
        descripcion: 'Elaboración de pan y productos de panadería',
        categoria: 'Servicios',
        activo: true
      },
      {
        nombre: 'Mecánica',
        descripcion: 'Reparación y mantenimiento de vehículos',
        categoria: 'Oficios',
        activo: true
      }
    ];

    const created = await Habilidad.bulkCreate(habilidadesEjemplo);
    console.log(`   ✅ ${created.length} habilidades insertadas\n`);

    // Mostrar datos insertados
    console.log('6. Habilidades disponibles:');
    created.forEach((hab, idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. [ID: ${hab.id_habilidad}] ${hab.nombre} - ${hab.categoria}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              TABLA HABILIDADES LISTA                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ Puedes probar el CRUD con:');
    console.log('   node test-habilidades-crud.cjs admin@parroquia.com Admin123!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
    }
    process.exit(1);
  }
}

recreateHabilidades();
