/**
 * Test para EDITAR (UPDATE) un tipo de disposición de basura
 * Base de datos: LOCAL (localhost:5432)
 */

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
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

async function testEditarDisposicionBasura() {
  try {
    console.log('✏️  TEST DE EDICIÓN - Tipo de Disposición de Basura');
    console.log('='.repeat(80));
    console.log('📍 Base de datos: localhost:5432 (parroquia_db)\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // 1. Mostrar todos los registros actuales
    console.log('1️⃣ REGISTROS ACTUALES:\n');
    const registrosActuales = await TipoDisposicionBasura.findAll({
      order: [['id_tipo_disposicion_basura', 'ASC']]
    });

    console.log('┌────┬────────────────────────────┬──────────────────────────────────┐');
    console.log('│ ID │ Nombre                     │ Descripción                      │');
    console.log('├────┼────────────────────────────┼──────────────────────────────────┤');
    registrosActuales.forEach(r => {
      const id = String(r.id_tipo_disposicion_basura).padStart(2, ' ');
      const nombre = r.nombre.substring(0, 26).padEnd(26, ' ');
      const desc = (r.descripcion || '').substring(0, 32).padEnd(32, ' ');
      console.log(`│ ${id} │ ${nombre} │ ${desc} │`);
    });
    console.log('└────┴────────────────────────────┴──────────────────────────────────┘\n');

    // 2. Seleccionar un registro para editar (ejemplo: ID 5)
    const idAEditar = 5;
    console.log(`2️⃣ BUSCANDO REGISTRO CON ID ${idAEditar}:\n`);

    const registroOriginal = await TipoDisposicionBasura.findByPk(idAEditar);

    if (!registroOriginal) {
      console.log(`❌ No existe registro con ID ${idAEditar}\n`);
      await sequelize.close();
      return;
    }

    console.log('   📄 DATOS ORIGINALES:');
    console.log(`      ID: ${registroOriginal.id_tipo_disposicion_basura}`);
    console.log(`      Nombre: ${registroOriginal.nombre}`);
    console.log(`      Descripción: ${registroOriginal.descripcion || 'Sin descripción'}`);
    console.log(`      Creado: ${registroOriginal.created_at}`);
    console.log(`      Actualizado: ${registroOriginal.updated_at}\n`);

    // 3. Actualizar el registro
    console.log('3️⃣ ACTUALIZANDO REGISTRO:\n');

    const datosNuevos = {
      nombre: 'Compostaje Mejorado',
      descripcion: 'Compostaje de residuos orgánicos con técnicas modernas de degradación aeróbica'
    };

    console.log('   📝 NUEVOS DATOS:');
    console.log(`      Nombre: ${datosNuevos.nombre}`);
    console.log(`      Descripción: ${datosNuevos.descripcion}\n`);

    // Método 1: Usando update() del modelo
    await registroOriginal.update(datosNuevos);

    console.log('   ✅ Registro actualizado\n');

    // 4. Verificar la actualización
    console.log('4️⃣ VERIFICANDO ACTUALIZACIÓN:\n');

    const registroActualizado = await TipoDisposicionBasura.findByPk(idAEditar);

    console.log('   📄 DATOS ACTUALIZADOS:');
    console.log(`      ID: ${registroActualizado.id_tipo_disposicion_basura}`);
    console.log(`      Nombre: ${registroActualizado.nombre}`);
    console.log(`      Descripción: ${registroActualizado.descripcion}`);
    console.log(`      Creado: ${registroActualizado.created_at}`);
    console.log(`      Actualizado: ${registroActualizado.updated_at}\n`);

    // 5. Comparar timestamps
    console.log('5️⃣ COMPARACIÓN DE TIMESTAMPS:\n');
    console.log(`   Creado (no cambió): ${registroOriginal.created_at === registroActualizado.created_at ? '✅' : '❌'}`);
    console.log(`   Actualizado (cambió): ${registroOriginal.updated_at !== registroActualizado.updated_at ? '✅' : '❌'}\n`);

    // 6. Opción: Revertir cambios
    console.log('6️⃣ ¿REVERTIR CAMBIOS? (descomentando el código)\n');
    
    // DESCOMENTAR PARA REVERTIR:
    /*
    await registroActualizado.update({
      nombre: registroOriginal.nombre,
      descripcion: registroOriginal.descripcion
    });
    console.log('   🔄 Cambios revertidos\n');
    */
    console.log('   ℹ️  Para revertir, descomenta el código en el script\n');

    // 7. Mostrar todos los registros después de la edición
    console.log('7️⃣ TODOS LOS REGISTROS DESPUÉS DE LA EDICIÓN:\n');
    const registrosFinales = await TipoDisposicionBasura.findAll({
      order: [['id_tipo_disposicion_basura', 'ASC']]
    });

    console.log('┌────┬────────────────────────────┬──────────────────────────────────┐');
    console.log('│ ID │ Nombre                     │ Descripción                      │');
    console.log('├────┼────────────────────────────┼──────────────────────────────────┤');
    registrosFinales.forEach(r => {
      const id = String(r.id_tipo_disposicion_basura).padStart(2, ' ');
      const nombre = r.nombre.substring(0, 26).padEnd(26, ' ');
      const desc = (r.descripcion || '').substring(0, 32).padEnd(32, ' ');
      const marcador = r.id_tipo_disposicion_basura === idAEditar ? ' ← EDITADO' : '';
      console.log(`│ ${id} │ ${nombre} │ ${desc} │${marcador}`);
    });
    console.log('└────┴────────────────────────────┴──────────────────────────────────┘\n');

    console.log('='.repeat(80));
    console.log('✅ EDICIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('💡 NOTAS:');
    console.log('   - El campo updated_at se actualizó automáticamente');
    console.log('   - El campo created_at no cambió');
    console.log('   - El ID no cambió\n');

    console.log('📝 PARA USAR EN EL API:');
    console.log('   Endpoint: PUT /api/catalog/disposicion-basura/tipos/5');
    console.log('   Headers: Authorization: Bearer <token>');
    console.log('   Body: {');
    console.log('     "nombre": "Compostaje Mejorado",');
    console.log('     "descripcion": "Nueva descripción"');
    console.log('   }\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}\n`);
    
    if (error.errors) {
      console.error('   Errores de validación:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    
    process.exit(1);
  }
}

testEditarDisposicionBasura();
