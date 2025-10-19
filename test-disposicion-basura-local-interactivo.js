/**
 * Test de disposicion_basura en BASE DE DATOS LOCAL
 * Versión con credenciales configurables
 */

import { Sequelize, DataTypes } from 'sequelize';
import readline from 'readline';

// Crear interfaz para input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configurarCredenciales() {
  console.log('🔐 CONFIGURACIÓN DE CREDENCIALES LOCALES');
  console.log('='.repeat(80));
  console.log('Presiona Enter para usar el valor por defecto\n');

  const host = await question('Host (localhost): ') || 'localhost';
  const port = await question('Puerto (5432): ') || '5432';
  const database = await question('Base de datos (parroquia_db): ') || 'parroquia_db';
  const username = await question('Usuario (postgres): ') || 'postgres';
  const password = await question('Contraseña: ');

  console.log('\n📊 Configuración ingresada:');
  console.log(`   Host: ${host}`);
  console.log(`   Puerto: ${port}`);
  console.log(`   Base de datos: ${database}`);
  console.log(`   Usuario: ${username}`);
  console.log(`   Contraseña: ${'*'.repeat(password.length)}\n`);

  const confirmar = await question('¿Continuar con estas credenciales? (s/n): ');
  
  if (confirmar.toLowerCase() !== 's') {
    console.log('❌ Operación cancelada');
    rl.close();
    process.exit(0);
  }

  return { host, port: parseInt(port), database, username, password };
}

async function testLocal() {
  try {
    const config = await configurarCredenciales();
    rl.close();

    console.log('\n🏠 TESTEANDO BASE DE DATOS LOCAL');
    console.log('='.repeat(80));
    
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      logging: false
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

    // 1. Conectar
    console.log('\n1️⃣ CONECTANDO...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente\n');

    // 2. Verificar si la tabla existe
    console.log('2️⃣ VERIFICANDO SI LA TABLA EXISTE:');
    const [tablaExiste] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tipos_disposicion_basura'
      );
    `);
    
    if (!tablaExiste[0].exists) {
      console.log('❌ LA TABLA NO EXISTE EN LA BASE DE DATOS LOCAL\n');
      console.log('💡 SOLUCIÓN:');
      console.log('   Ejecuta las migraciones:\n');
      console.log('   npx sequelize-cli db:migrate\n');
      await sequelize.close();
      return;
    }
    
    console.log('✅ La tabla existe\n');

    // 3. Contar registros
    console.log('3️⃣ CONTANDO REGISTROS:');
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM tipos_disposicion_basura;
    `);
    
    console.log(`   Total: ${count[0].total}\n`);

    if (parseInt(count[0].total) === 0) {
      console.log('⚠️  LA TABLA ESTÁ VACÍA\n');
      console.log('💡 Para poblarla, ejecuta:');
      console.log('   npx sequelize-cli db:seed --seed 20240101000006-tipos-disposicion-basura.cjs\n');
    } else {
      // 4. Listar registros
      console.log('4️⃣ LISTANDO REGISTROS:');
      const [registros] = await sequelize.query(`
        SELECT * FROM tipos_disposicion_basura ORDER BY id_tipo_disposicion_basura;
      `);
      
      registros.forEach(r => {
        console.log(`   ID ${r.id_tipo_disposicion_basura}: ${r.nombre}`);
      });

      // 5. Probar findByPk(5)
      console.log('\n5️⃣ PROBANDO findByPk(5):');
      const tipo5 = await TipoDisposicionBasura.findByPk(5);
      
      if (!tipo5) {
        console.log('   ❌ NO EXISTE ID 5\n');
      } else {
        console.log('   ✅ Encontrado:');
        console.log(JSON.stringify(tipo5.toJSON(), null, 2));
      }

      // 6. Probar getAllTipos
      console.log('\n6️⃣ PROBANDO findAll:');
      const todos = await TipoDisposicionBasura.findAll({
        order: [['id_tipo_disposicion_basura', 'ASC']]
      });
      console.log(`   ✅ ${todos.length} registros encontrados\n`);

      // 7. Probar crear
      console.log('7️⃣ PROBANDO CREATE:');
      try {
        const nuevoTipo = await TipoDisposicionBasura.create({
          nombre: 'Test - Prueba Local',
          descripcion: 'Registro de prueba'
        });
        
        console.log(`   ✅ Creado con ID: ${nuevoTipo.id_tipo_disposicion_basura}`);
        
        // Eliminar
        await nuevoTipo.destroy();
        console.log('   🗑️  Eliminado\n');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('✅ PRUEBA COMPLETADA EN BASE DE DATOS LOCAL\n');

    await sequelize.close();

  } catch (error) {
    rl.close();
    console.error('\n❌ ERROR:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}\n`);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 Verifica:');
      console.error('   - PostgreSQL está corriendo');
      console.error('   - Las credenciales son correctas');
      console.error('   - La base de datos existe\n');
    }
    
    if (error.original?.code === '28P01') {
      console.error('🔴 Contraseña incorrecta\n');
    }
    
    process.exit(1);
  }
}

testLocal();
