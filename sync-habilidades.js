/**
 * Script para sincronizar el modelo de Habilidades con la base de datos
 * Crea la tabla 'habilidades' si no existe
 */

import sequelize from './config/sequelize.js';
import Habilidad from './src/models/catalog/Habilidad.js';

async function syncHabilidades() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       SINCRONIZACIÓN MODELO HABILIDADES                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa\n');

    // Sincronizar modelo
    console.log('2. Sincronizando modelo Habilidad...');
    console.log('   Tabla: habilidades');
    console.log('   Columnas:');
    console.log('   - id_habilidad (BIGINT, PK, AUTO_INCREMENT)');
    console.log('   - nombre (VARCHAR(100), UNIQUE, NOT NULL)');
    console.log('   - descripcion (TEXT)');
    console.log('   - categoria (VARCHAR(50))');
    console.log('   - activo (BOOLEAN, DEFAULT true)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)\n');

    await Habilidad.sync({ alter: true });
    console.log('   ✅ Modelo sincronizado exitosamente\n');

    // Verificar tabla creada
    console.log('3. Verificando tabla en la base de datos...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'habilidades'
      ORDER BY ordinal_position;
    `);

    if (results.length > 0) {
      console.log('   ✅ Tabla "habilidades" creada correctamente\n');
      console.log('   Columnas encontradas:');
      results.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
    } else {
      console.log('   ❌ No se encontró la tabla "habilidades"\n');
    }

    // Insertar datos de ejemplo (opcional)
    console.log('\n4. ¿Deseas insertar datos de ejemplo? (Solo si la tabla está vacía)');
    const count = await Habilidad.count();
    
    if (count === 0) {
      console.log('   Insertando datos de ejemplo...');
      
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
        }
      ];

      await Habilidad.bulkCreate(habilidadesEjemplo);
      console.log(`   ✅ ${habilidadesEjemplo.length} habilidades de ejemplo insertadas\n`);
    } else {
      console.log(`   ℹ️  La tabla ya contiene ${count} registro(s), no se insertaron datos de ejemplo\n`);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  SINCRONIZACIÓN EXITOSA                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ El modelo de Habilidades está listo para usar');
    console.log('   Puedes probar el CRUD con: node test-habilidades-crud.cjs\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    console.error('\nDetalles del error:');
    console.error('  Mensaje:', error.message);
    if (error.parent) {
      console.error('  SQL Error:', error.parent.message);
    }
    process.exit(1);
  }
}

// Ejecutar sincronización
syncHabilidades();
