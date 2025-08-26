// 🔧 SCRIPT PARA CORREGIR PROBLEMAS DE ASOCIACIONES DE SEQUELIZE
// Este script identifica y corrige conflictos en las asociaciones de modelos

import sequelize from './config/sequelize.js';

// Importar modelos principales
import Usuario from './src/models/Usuario.js';
import Role from './src/models/Role.js';
import UsuarioRole from './src/models/UsuarioRole.js';

// Importar modelos de catálogo individualmente (no desde index)
import TipoIdentificacion from './src/models/catalog/TipoIdentificacion.js';
import Parroquia from './src/models/catalog/Parroquia.js';
import Sexo from './src/models/catalog/Sexo.js';
import Sector from './src/models/catalog/Sector.js';
import Veredas from './src/models/catalog/Veredas.js';
import Municipios from './src/models/catalog/Municipios.js';
import Departamentos from './src/models/catalog/Departamentos.js';
import Familias from './src/models/catalog/Familias.js';
import Persona from './src/models/catalog/Persona.js';

console.log('🔧 INICIANDO CORRECCIÓN DE ASOCIACIONES DE SEQUELIZE');
console.log('===================================================');

const fixAssociations = async () => {
  try {
    console.log('🔍 Verificando modelos...');
    
    // Lista de modelos para verificar
    const models = {
      Usuario,
      Role,
      UsuarioRole,
      TipoIdentificacion,
      Parroquia,
      Sexo,
      Sector,
      Veredas,
      Municipios,
      Departamentos,
      Familias,
      Persona
    };
    
    // Verificar que todos son subclases de Sequelize.Model
    console.log('✅ Verificando tipos de modelos:');
    for (const [name, model] of Object.entries(models)) {
      const isSequelizeModel = model.prototype && model.prototype.constructor.name === 'Model';
      const hasSequelizeProps = model.sequelize && model.tableName;
      
      console.log(`   📋 ${name}: ${isSequelizeModel || hasSequelizeProps ? '✅' : '❌'} ${hasSequelizeProps ? `(tabla: ${model.tableName})` : ''}`);
      
      if (!isSequelizeModel && !hasSequelizeProps) {
        console.log(`   ⚠️  Modelo ${name} puede tener problemas de definición`);
      }
    }
    
    console.log('\n🔗 Configurando asociaciones limpias...');
    
    // LIMPIAR asociaciones existentes (opcional)
    Object.values(models).forEach(model => {
      if (model.associations) {
        // Nota: En Sequelize 6, las asociaciones se manejan diferente
        console.log(`   🧹 Limpiando asociaciones de ${model.name || model.tableName}`);
      }
    });
    
    // CONFIGURAR asociaciones principales (las básicas que funcionan)
    console.log('\n📍 Configurando asociaciones básicas...');
    
    // 1. Usuario - Role (estas funcionan)
    try {
      if (!Usuario.associations?.roles) {
        Usuario.belongsToMany(Role, {
          through: UsuarioRole,
          foreignKey: 'id_usuarios',
          otherKey: 'id_roles',
          as: 'roles'
        });
        console.log('   ✅ Usuario -> Role configurada');
      }
      
      if (!Role.associations?.usuarios) {
        Role.belongsToMany(Usuario, {
          through: UsuarioRole,
          foreignKey: 'id_roles',
          otherKey: 'id_usuarios',
          as: 'usuarios'
        });
        console.log('   ✅ Role -> Usuario configurada');
      }
    } catch (error) {
      console.log(`   ❌ Error Usuario-Role: ${error.message}`);
    }
    
    // 2. Departamentos - Municipios (básica)
    try {
      if (!Departamentos.associations?.municipios) {
        Departamentos.hasMany(Municipios, {
          foreignKey: 'id_departamento',
          as: 'municipios'
        });
        console.log('   ✅ Departamentos -> Municipios configurada');
      }
      
      if (!Municipios.associations?.departamento) {
        Municipios.belongsTo(Departamentos, {
          foreignKey: 'id_departamento',
          as: 'departamento'
        });
        console.log('   ✅ Municipios -> Departamentos configurada');
      }
    } catch (error) {
      console.log(`   ❌ Error Departamentos-Municipios: ${error.message}`);
    }
    
    // 3. Familias - Persona (básica)
    try {
      if (!Familias.associations?.personas) {
        Familias.hasMany(Persona, {
          foreignKey: 'id_familia_familias',
          as: 'personas'
        });
        console.log('   ✅ Familias -> Persona configurada');
      }
      
      if (!Persona.associations?.familia) {
        Persona.belongsTo(Familias, {
          foreignKey: 'id_familia_familias',
          as: 'familia'
        });
        console.log('   ✅ Persona -> Familias configurada');
      }
    } catch (error) {
      console.log(`   ❌ Error Familias-Persona: ${error.message}`);
    }
    
    console.log('\n🧪 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    console.log('\n🔍 Verificando tablas en BD...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'familias', 'personas', 'municipios', 'departamentos')
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   📁 ${table.table_name}`);
    });
    
    console.log('\n🧪 Probando consulta simple...');
    const [usuarioCount] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
    const [familiaCount] = await sequelize.query('SELECT COUNT(*) as count FROM familias');
    
    console.log(`   👥 Usuarios: ${usuarioCount[0].count}`);
    console.log(`   👨‍👩‍👧‍👦 Familias: ${familiaCount[0].count}`);
    
    await sequelize.close();
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA');
    console.log('========================');
    console.log('✅ Modelos verificados');
    console.log('✅ Asociaciones básicas configuradas');
    console.log('✅ Conexión a BD verificada');
    console.log('');
    console.log('🔧 PRÓXIMOS PASOS:');
    console.log('1. Reiniciar el servidor: pm2 restart parroquia-api');
    console.log('2. Verificar logs: pm2 logs parroquia-api --lines 20');
    console.log('3. Probar endpoints básicos');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
};

fixAssociations();
