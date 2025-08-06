import { Usuario, Role, sequelize } from './src/models/index.js';

async function debugUUID() {
  const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
  
  try {
    console.log('🔍 Iniciando diagnóstico de UUID...');
    console.log('UUID a probar:', testUUID);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Verificar conexión a la base de datos
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // 2. Buscar el usuario específico
    console.log('\n2️⃣ Buscando usuario específico...');
    const startTime = Date.now();
    
    const user = await Usuario.findByPk(testUUID, {
      include: [{
        association: 'roles',
        attributes: ['id', 'nombre']
      }],
      paranoid: false // Incluir usuarios eliminados
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo de consulta: ${queryTime}ms`);
    
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('   📧 Email:', user.correo_electronico);
      console.log('   🔑 ID:', user.id);
      console.log('   ✅ Activo:', user.activo ? 'Sí' : 'No');
      console.log('   📧 Email verificado:', user.email_verificado ? 'Sí' : 'No');
      console.log('   🗑️ Eliminado:', user.deleted_at ? 'Sí (' + user.deleted_at + ')' : 'No');
      console.log('   👥 Roles:', user.roles?.map(r => r.nombre).join(', ') || 'Sin roles');
      console.log('   📅 Creado:', user.created_at);
      console.log('   🔄 Actualizado:', user.updated_at);
    } else {
      console.log('❌ Usuario no encontrado con ese UUID');
    }
    
    // 3. Listar algunos usuarios existentes
    console.log('\n3️⃣ Listando usuarios existentes (primeros 5)...');
    const existingUsers = await Usuario.findAll({
      limit: 5,
      include: [{
        association: 'roles',
        attributes: ['id', 'nombre']
      }],
      paranoid: false,
      order: [['created_at', 'DESC']]
    });
    
    if (existingUsers.length > 0) {
      console.log('📋 Usuarios encontrados:');
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.correo_electronico} (ID: ${user.id})`);
        console.log(`      Roles: ${user.roles?.map(r => r.nombre).join(', ') || 'Sin roles'}`);
        console.log(`      Estado: ${user.activo ? 'Activo' : 'Inactivo'} | ${user.deleted_at ? 'Eliminado' : 'No eliminado'}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios en la base de datos');
    }
    
    // 4. Verificar estructura de la tabla usuarios
    console.log('\n4️⃣ Verificando estructura de la tabla usuarios...');
    const tableInfo = await sequelize.getQueryInterface().describeTable('usuarios');
    console.log('📊 Columnas de la tabla usuarios:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`   • ${column}: ${tableInfo[column].type}`);
    });
    
    // 5. Verificar índices
    console.log('\n5️⃣ Verificando índices de la tabla usuarios...');
    const indexes = await sequelize.getQueryInterface().showIndex('usuarios');
    console.log('🔍 Índices encontrados:');
    indexes.forEach(index => {
      console.log(`   • ${index.name}: [${index.fields.map(f => f.name).join(', ')}] ${index.primary ? '(PRIMARY)' : ''} ${index.unique ? '(UNIQUE)' : ''}`);
    });
    
    // 6. Prueba de consulta directa SQL
    console.log('\n6️⃣ Prueba de consulta SQL directa...');
    const sqlStartTime = Date.now();
    const [results] = await sequelize.query(
      'SELECT id, correo_electronico, activo, deleted_at FROM usuarios WHERE id = :uuid',
      {
        replacements: { uuid: testUUID },
        type: sequelize.QueryTypes.SELECT
      }
    );
    const sqlQueryTime = Date.now() - sqlStartTime;
    console.log(`⏱️ Tiempo de consulta SQL directa: ${sqlQueryTime}ms`);
    
    if (results) {
      console.log('✅ Resultado SQL directo:', results);
    } else {
      console.log('❌ No se encontró resultado con consulta SQL directa');
    }
    
    // 7. Verificar roles asociados
    console.log('\n7️⃣ Verificando tabla de roles...');
    const roles = await Role.findAll({
      limit: 5,
      order: [['nombre', 'ASC']]
    });
    
    console.log('👥 Roles disponibles:');
    roles.forEach(role => {
      console.log(`   • ${role.nombre} (ID: ${role.id})`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.original) {
      console.error('Error original:', error.original);
    }
  } finally {
    console.log('\n🔚 Cerrando conexión...');
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  }
}

debugUUID().catch(console.error);
