/**
 * Test directo de la consulta que falla
 */

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '206.62.139.100',
  port: 5432,  // Puerto donde se conecta el API
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: console.log
});

// Definir el modelo exactamente como está en el código
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

async function testConsulta() {
  try {
    console.log('🔍 TESTEANDO CONSULTA EXACTA QUE FALLA');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado al puerto 5432\n');

    // Probar la consulta exacta del servicio
    console.log('📝 Ejecutando: TipoDisposicionBasura.findByPk(5)\n');
    
    const tipo = await TipoDisposicionBasura.findByPk(5);
    
    if (!tipo) {
      console.log('❌ No se encontró el registro');
    } else {
      console.log('✅ Registro encontrado:');
      console.log(JSON.stringify(tipo.toJSON(), null, 2));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ LA CONSULTA FUNCIONA CORRECTAMENTE');
    console.log('   El problema debe ser otro (permisos, transacción, pool de conexiones, etc.)\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ ERROR EN LA CONSULTA:');
    console.error('   Mensaje:', error.message);
    console.error('   Nombre:', error.name);
    if (error.original) {
      console.error('   Error original:', error.original);
    }
    console.error('\n   Stack:', error.stack);
    process.exit(1);
  }
}

testConsulta();
