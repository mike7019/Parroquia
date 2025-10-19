/**
 * Test de disposicion_basura en BASE DE DATOS LOCAL
 * Puerto: 5432 (localhost)
 */

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'postgres',
  password: 'postgres',
  logging: console.log
});

// Definir el modelo
const TipoDisposicionBasura = sequelize.define('TipoDisposicionBasura', {
  id_tipo_disposicion_basura: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'TipoDisposicionBasura',
  tableName: 'tipos_disposicion_basura',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

async function testLocal() {
  try {
    console.log('🏠 TESTEANDO BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    console.log('📍 Host: localhost:5432');
    console.log('📊 Base de datos: parroquia_db\n');
    
    // 1. Conectar
    console.log('1️⃣ CONECTANDO...\n');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente\n');

    // 2. Verificar si la tabla existe
    console.log('2️⃣ VERIFICANDO SI LA TABLA EXISTE:\n');
    const [tablaExiste] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tipos_disposicion_basura'
      );
    `);
    
    if (!tablaExiste[0].exists) {
      console.log('❌ LA TABLA NO EXISTE EN LA BASE DE DATOS LOCAL');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   Ejecuta las migraciones o copia los seeders:\n');
      console.log('   npm run db:migrate');
      console.log('   npm run db:seed:config\n');
      await sequelize.close();
      return;
    }
    
    console.log('✅ La tabla existe\n');

    // 3. Contar registros
    console.log('3️⃣ CONTANDO REGISTROS:\n');
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM tipos_disposicion_basura;
    `);
    
    console.log(`📊 Total de registros: ${count[0].total}\n`);

    if (parseInt(count[0].total) === 0) {
      console.log('⚠️  LA TABLA ESTÁ VACÍA');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   Ejecuta el seeder:\n');
      console.log('   npx sequelize-cli db:seed --seed 20240101000006-tipos-disposicion-basura.cjs\n');
    } else {
      // 4. Listar todos los registros
      console.log('4️⃣ LISTANDO TODOS LOS REGISTROS:\n');
      const [registros] = await sequelize.query(`
        SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura;
      `);
      
      registros.forEach(r => {
        console.log(`  ID ${r.id_tipo_disposicion_basura}: ${r.nombre}`);
        if (r.descripcion) {
          console.log(`     📝 ${r.descripcion}`);
        }
      });

      // 5. Probar consulta por ID 5
      console.log('\n5️⃣ PROBANDO CONSULTA POR ID 5 (usando Sequelize):\n');
      
      const tipo5 = await TipoDisposicionBasura.findByPk(5);
      
      if (!tipo5) {
        console.log('❌ NO EXISTE REGISTRO CON ID 5 en la base local');
      } else {
        console.log('✅ Registro encontrado:');
        console.log(JSON.stringify(tipo5.toJSON(), null, 2));
      }

      // 6. Probar getAllTipos (como en el servicio)
      console.log('\n6️⃣ PROBANDO getAllTipos:\n');
      
      const todos = await TipoDisposicionBasura.findAll({
        order: [['id_tipo_disposicion_basura', 'ASC']]
      });
      
      console.log(`✅ Se encontraron ${todos.length} tipos de disposición`);

      // 7. Probar crear un nuevo tipo
      console.log('\n7️⃣ PROBANDO CREAR NUEVO TIPO:\n');
      
      try {
        const nuevoTipo = await TipoDisposicionBasura.create({
          nombre: 'Test - Separación en la fuente',
          descripcion: 'Tipo de prueba creado por el diagnóstico'
        });
        
        console.log(`✅ Tipo creado con ID: ${nuevoTipo.id_tipo_disposicion_basura}`);
        
        // Eliminar el tipo de prueba
        await nuevoTipo.destroy();
        console.log('🗑️  Tipo de prueba eliminado\n');
      } catch (error) {
        console.log('❌ Error creando tipo:', error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ PRUEBA EN BASE DE DATOS LOCAL COMPLETADA\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA LOCAL:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   1. Verifica que PostgreSQL esté corriendo en tu máquina');
      console.error('   2. Verifica las credenciales (usuario: postgres, password: postgres)');
      console.error('   3. Verifica que exista la base de datos "parroquia_db"');
      console.error('\n   Crear base de datos:');
      console.error('   psql -U postgres');
      console.error('   CREATE DATABASE parroquia_db;\n');
    }
    
    if (error.original) {
      console.error('\n   Error original:', error.original);
    }
    
    console.error('\n   Stack:', error.stack);
    process.exit(1);
  }
}

testLocal();
