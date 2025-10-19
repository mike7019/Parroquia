/**
 * Comparar datos entre puerto 5432 y 5433
 */

import { Sequelize } from 'sequelize';

async function compararPuertos() {
  console.log('🔍 COMPARANDO tipos_disposicion_basura EN AMBOS PUERTOS');
  console.log('='.repeat(80));

  // Puerto 5432 (donde se conecta el API)
  const db5432 = new Sequelize({
    dialect: 'postgres',
    host: '206.62.139.100',
    port: 5432,
    database: 'parroquia_db',
    username: 'parroquia_user',
    password: 'ParroquiaSecure2025',
    logging: false
  });

  // Puerto 5433 (donde están los datos correctos)
  const db5433 = new Sequelize({
    dialect: 'postgres',
    host: '206.62.139.100',
    port: 5433,
    database: 'parroquia_db',
    username: 'parroquia_user',
    password: 'ParroquiaSecure2025',
    logging: false
  });

  try {
    // Verificar puerto 5432
    console.log('\n📍 PUERTO 5432 (Donde se conecta el API):');
    console.log('-'.repeat(80));
    
    try {
      await db5432.authenticate();
      console.log('✅ Conexión exitosa');
      
      const [datos5432] = await db5432.query(`
        SELECT COUNT(*) as total FROM tipos_disposicion_basura;
      `);
      
      console.log(`   Registros: ${datos5432[0].total}`);
      
      if (parseInt(datos5432[0].total) > 0) {
        const [registros5432] = await db5432.query(`
          SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura;
        `);
        registros5432.forEach(r => {
          console.log(`   ID ${r.id_tipo_disposicion_basura}: ${r.nombre}`);
        });
      } else {
        console.log('   ⚠️  LA TABLA ESTÁ VACÍA - ESTE ES EL PROBLEMA');
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    // Verificar puerto 5433
    console.log('\n📍 PUERTO 5433 (Base de datos limpia):');
    console.log('-'.repeat(80));
    
    try {
      await db5433.authenticate();
      console.log('✅ Conexión exitosa');
      
      const [datos5433] = await db5433.query(`
        SELECT COUNT(*) as total FROM tipos_disposicion_basura;
      `);
      
      console.log(`   Registros: ${datos5433[0].total}`);
      
      if (parseInt(datos5433[0].total) > 0) {
        const [registros5433] = await db5433.query(`
          SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura;
        `);
        registros5433.forEach(r => {
          console.log(`   ID ${r.id_tipo_disposicion_basura}: ${r.nombre}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('💡 SOLUCIÓN:');
    console.log('   El API debe conectarse al puerto 5433, no al 5432');
    console.log('   Opciones:');
    console.log('   1. Cambiar DB_PORT=5433 en las variables de entorno del servidor');
    console.log('   2. Migrar los datos del puerto 5433 al puerto 5432');
    console.log('   3. Copiar los seeders al puerto 5432\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db5432.close();
    await db5433.close();
  }
}

compararPuertos();
