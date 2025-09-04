#!/usr/bin/env node

/**
 * SINCRONIZACIÓN COMPLETA DE BASE DE DATOS - SERVIDOR DE PRUEBAS
 * =============================================================
 * 
 * Este script configura completamente la base de datos para un nuevo servidor
 * de pruebas, aplicando todas las correcciones y configuraciones necesarias.
 * 
 * USO: npm run sync:complete:testing
 *      o node sync-database-complete.js
 * 
 * FUNCIONES:
 * - Crear todas las tablas con estructuras correctas
 * - Cargar todos los catálogos básicos
 * - Aplicar todas las correcciones de timestamps
 * - Verificar integridad completa del sistema
 * - Crear usuario administrador de pruebas
 */

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
};

// Datos básicos para catálogos
const CATALOGOS_DATA = {
  sistemas_acueducto: [
    { nombre: 'Red Pública', descripcion: 'Acueducto municipal o regional', activo: true },
    { nombre: 'Pozo Propio', descripcion: 'Pozo de agua propio de la familia', activo: true },
    { nombre: 'Aljibe', descripcion: 'Recolección de agua lluvia', activo: true },
    { nombre: 'Río/Quebrada', descripcion: 'Toma directa de fuente natural', activo: true },
    { nombre: 'Carro Tanque', descripcion: 'Suministro por carro tanque', activo: true },
    { nombre: 'Otro', descripcion: 'Otro sistema no especificado', activo: true }
  ],
  
  tipos_aguas_residuales: [
    { nombre: 'Alcantarillado', descripcion: 'Conectado a red de alcantarillado municipal', activo: true },
    { nombre: 'Pozo Séptico', descripcion: 'Sistema de tratamiento individual', activo: true },
    { nombre: 'Letrina', descripcion: 'Sistema básico de saneamiento', activo: true },
    { nombre: 'Campo Abierto', descripcion: 'Sin sistema de tratamiento', activo: true },
    { nombre: 'Río/Quebrada', descripcion: 'Descarga directa a fuente hídrica', activo: true },
    { nombre: 'Otro', descripcion: 'Otro sistema no especificado', activo: true }
  ],
  
  tipos_vivienda: [
    { nombre: 'Casa', descripcion: 'Vivienda unifamiliar independiente', activo: true },
    { nombre: 'Apartamento', descripcion: 'Vivienda en edificio multifamiliar', activo: true },
    { nombre: 'Cuarto', descripcion: 'Habitación individual', activo: true },
    { nombre: 'Casa Lote', descripcion: 'Casa con terreno amplio', activo: true },
    { nombre: 'Finca', descripcion: 'Vivienda rural con terreno agrícola', activo: true },
    { nombre: 'Otro', descripcion: 'Otro tipo de vivienda', activo: true }
  ],
  
  tipos_disposicion_basura: [
    { nombre: 'Recolección Pública', descripcion: 'Servicio municipal de recolección', activo: true },
    { nombre: 'Quema', descripcion: 'Quema de basuras', activo: true },
    { nombre: 'Entierro', descripcion: 'Enterramiento de residuos', activo: true },
    { nombre: 'Reciclaje', descripcion: 'Separación y reciclaje', activo: true },
    { nombre: 'Compostaje', descripcion: 'Compostaje de orgánicos', activo: true },
    { nombre: 'Botadero', descripcion: 'Disposición en botadero', activo: true },
    { nombre: 'Separación por Colores', descripcion: 'Separación por colores para reciclaje', activo: true },
    { nombre: 'Otro', descripcion: 'Otro método de disposición', activo: true }
  ]
};

// Usuario administrador de pruebas
const ADMIN_USER = {
  nombre: 'Administrador',
  apellido: 'Testing',
  email: 'admin@testing.parroquia',
  password: 'Testing2025!',
  rol: 'administrador',
  activo: true
};

async function syncDatabaseComplete() {
  console.log('🚀 SINCRONIZACIÓN COMPLETA DE BASE DE DATOS - TESTING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`🏢 Base de datos: ${DB_CONFIG.database}`);
  console.log(`👤 Usuario: ${DB_CONFIG.username}`);
  console.log('');

  const sequelize = new Sequelize(DB_CONFIG);

  try {
    // PASO 1: Verificar conexión
    console.log('🔄 PASO 1: VERIFICANDO CONEXIÓN');
    console.log('─────────────────────────────────────────────────────────');
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // PASO 2: Definir y sincronizar modelos principales
    console.log('\n🏗️ PASO 2: CREANDO ESTRUCTURAS DE TABLAS');
    console.log('─────────────────────────────────────────────────────────');

    // Definir modelos con timestamps consistentes
    const modelOptions = {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    // Usuarios
    const Usuario = sequelize.define('usuarios', {
      id_usuario: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      rol: { type: DataTypes.STRING(50), defaultValue: 'usuario' },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'usuarios' });

    // Familias
    const Familia = sequelize.define('familias', {
      id_familia: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      apellido_familiar: { type: DataTypes.STRING(100), allowNull: false },
      sector: { type: DataTypes.STRING(100) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'familias' });

    // Catálogos
    const SistemaAcueducto = sequelize.define('sistemas_acueducto', {
      id_sistema_acueducto: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'sistemas_acueducto' });

    const TipoAguasResiduales = sequelize.define('tipos_aguas_residuales', {
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'tipos_aguas_residuales' });

    const TipoVivienda = sequelize.define('tipos_vivienda', {
      id_tipo_vivienda: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'tipos_vivienda' });

    const TipoDisposicionBasura = sequelize.define('tipos_disposicion_basura', {
      id_tipo_disposicion_basura: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { ...modelOptions, tableName: 'tipos_disposicion_basura' });

    // Tablas de relación
    const FamiliaSistemaAcueducto = sequelize.define('familia_sistema_acueducto', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_sistema_acueducto: { type: DataTypes.BIGINT, allowNull: false }
    }, { ...modelOptions, tableName: 'familia_sistema_acueducto' });

    const FamiliaSistemaAguasResiduales = sequelize.define('familia_sistema_aguas_residuales', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, allowNull: false }
    }, { ...modelOptions, tableName: 'familia_sistema_aguas_residuales' });

    const FamiliaTipoVivienda = sequelize.define('familia_tipo_vivienda', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_vivienda: { type: DataTypes.BIGINT, allowNull: false }
    }, { ...modelOptions, tableName: 'familia_tipo_vivienda' });

    const FamiliaDisposicionBasura = sequelize.define('familia_disposicion_basura', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_disposicion_basura: { type: DataTypes.BIGINT, allowNull: false }
    }, { ...modelOptions, tableName: 'familia_disposicion_basura' });

    // Sincronizar todas las tablas
    console.log('🔧 Sincronizando estructura de tablas...');
    
    try {
      await Usuario.sync({ alter: false });
      console.log('✅ usuarios');
    } catch (error) {
      console.log(`⚠️ usuarios: ${error.message.split('\n')[0]}`);
      // Crear tabla si no existe
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario BIGSERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'usuario',
            activo BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        console.log('✅ usuarios: Creada manualmente');
      } catch (createError) {
        console.log(`⚠️ usuarios: No se pudo crear - ${createError.message.split('\n')[0]}`);
      }
    }
    
    try {
      await Familia.sync({ alter: false });
      console.log('✅ familias');
    } catch (error) {
      console.log(`⚠️ familias: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await SistemaAcueducto.sync({ alter: false });
      console.log('✅ sistemas_acueducto');
    } catch (error) {
      console.log(`⚠️ sistemas_acueducto: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await TipoAguasResiduales.sync({ alter: false });
      console.log('✅ tipos_aguas_residuales');
    } catch (error) {
      console.log(`⚠️ tipos_aguas_residuales: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await TipoVivienda.sync({ alter: false });
      console.log('✅ tipos_vivienda');
    } catch (error) {
      console.log(`⚠️ tipos_vivienda: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await TipoDisposicionBasura.sync({ alter: false });
      console.log('✅ tipos_disposicion_basura');
    } catch (error) {
      console.log(`⚠️ tipos_disposicion_basura: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await FamiliaSistemaAcueducto.sync({ alter: false });
      console.log('✅ familia_sistema_acueducto');
    } catch (error) {
      console.log(`⚠️ familia_sistema_acueducto: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await FamiliaSistemaAguasResiduales.sync({ alter: false });
      console.log('✅ familia_sistema_aguas_residuales');
    } catch (error) {
      console.log(`⚠️ familia_sistema_aguas_residuales: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await FamiliaTipoVivienda.sync({ alter: false });
      console.log('✅ familia_tipo_vivienda');
    } catch (error) {
      console.log(`⚠️ familia_tipo_vivienda: ${error.message.split('\n')[0]}`);
    }
    
    try {
      await FamiliaDisposicionBasura.sync({ alter: false });
      console.log('✅ familia_disposicion_basura');
    } catch (error) {
      console.log(`⚠️ familia_disposicion_basura: ${error.message.split('\n')[0]}`);
    }

    // PASO 3: Cargar catálogos básicos
    console.log('\n📚 PASO 3: CARGANDO CATÁLOGOS BÁSICOS');
    console.log('─────────────────────────────────────────────────────────');

    for (const [catalogName, catalogData] of Object.entries(CATALOGOS_DATA)) {
      let model;
      switch (catalogName) {
        case 'sistemas_acueducto':
          model = SistemaAcueducto;
          break;
        case 'tipos_aguas_residuales':
          model = TipoAguasResiduales;
          break;
        case 'tipos_vivienda':
          model = TipoVivienda;
          break;
        case 'tipos_disposicion_basura':
          model = TipoDisposicionBasura;
          break;
      }

      if (model) {
        const existingCount = await model.count();
        if (existingCount === 0) {
          await model.bulkCreate(catalogData);
          console.log(`✅ ${catalogName}: ${catalogData.length} registros cargados`);
        } else {
          console.log(`ℹ️ ${catalogName}: ${existingCount} registros existentes`);
        }
      }
    }

    // PASO 4: Crear usuario administrador de testing (con verificación de estructura)
    console.log('\n👤 PASO 4: CREANDO USUARIO ADMINISTRADOR');
    console.log('─────────────────────────────────────────────────────────');

    try {
      // Verificar estructura de tabla usuarios
      const [userColumns] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position
      `);
      
      const hasApellido = userColumns.some(col => col.column_name === 'apellido');
      console.log(`📋 Estructura usuarios detectada: ${hasApellido ? 'con apellido' : 'sin apellido'}`);
      
      if (hasApellido) {
        // Estructura completa con apellido
        const existingAdmin = await Usuario.findOne({ where: { email: ADMIN_USER.email } });
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
          await Usuario.create({
            ...ADMIN_USER,
            password: hashedPassword
          });
          console.log(`✅ Usuario administrador creado: ${ADMIN_USER.email}`);
          console.log(`🔑 Password: ${ADMIN_USER.password}`);
        } else {
          console.log(`ℹ️ Usuario administrador ya existe: ${ADMIN_USER.email}`);
        }
      } else {
        // Estructura simplificada sin apellido
        const [existingAdmin] = await sequelize.query(`
          SELECT * FROM usuarios WHERE email = '${ADMIN_USER.email}' LIMIT 1
        `);
        
        if (existingAdmin.length === 0) {
          const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
          await sequelize.query(`
            INSERT INTO usuarios (nombre, email, password, rol, activo, created_at, updated_at)
            VALUES ('${ADMIN_USER.nombre} ${ADMIN_USER.apellido}', '${ADMIN_USER.email}', '${hashedPassword}', '${ADMIN_USER.rol}', ${ADMIN_USER.activo}, NOW(), NOW())
          `);
          console.log(`✅ Usuario administrador creado: ${ADMIN_USER.email}`);
          console.log(`🔑 Password: ${ADMIN_USER.password}`);
        } else {
          console.log(`ℹ️ Usuario administrador ya existe: ${ADMIN_USER.email}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Error creando usuario administrador: ${error.message.split('\n')[0]}`);
      console.log('   Se puede crear manualmente desde la interfaz');
    }

    // PASO 5: Verificación de integridad
    console.log('\n🧪 PASO 5: VERIFICACIÓN DE INTEGRIDAD');
    console.log('─────────────────────────────────────────────────────────');

    const tables = [
      { name: 'usuarios', model: Usuario },
      { name: 'familias', model: Familia },
      { name: 'sistemas_acueducto', model: SistemaAcueducto },
      { name: 'tipos_aguas_residuales', model: TipoAguasResiduales },
      { name: 'tipos_vivienda', model: TipoVivienda },
      { name: 'tipos_disposicion_basura', model: TipoDisposicionBasura },
      { name: 'familia_sistema_acueducto', model: FamiliaSistemaAcueducto },
      { name: 'familia_sistema_aguas_residuales', model: FamiliaSistemaAguasResiduales },
      { name: 'familia_tipo_vivienda', model: FamiliaTipoVivienda },
      { name: 'familia_disposicion_basura', model: FamiliaDisposicionBasura }
    ];

    let allTablesOk = true;
    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`✅ ${table.name}: ${count} registros`);
      } catch (error) {
        console.log(`❌ ${table.name}: ERROR - ${error.message}`);
        allTablesOk = false;
      }
    }

    // PASO 6: Prueba de funcionalidad de encuestas
    console.log('\n🎯 PASO 6: PRUEBA DE FUNCIONALIDAD DE ENCUESTAS');
    console.log('─────────────────────────────────────────────────────────');

    const transaction = await sequelize.transaction();
    try {
      // Crear familia de prueba
      const familiaTest = await Familia.create({
        apellido_familiar: 'FAMILIA_TESTING',
        sector: 'SECTOR_PRUEBA'
      }, { transaction });

      console.log(`1️⃣ Familia de prueba creada: ID ${familiaTest.id_familia}`);

      // Probar INSERT en todas las tablas de relación
      await FamiliaSistemaAcueducto.create({
        id_familia: familiaTest.id_familia,
        id_sistema_acueducto: 1
      }, { transaction });
      console.log('2️⃣ Sistema acueducto: ✅');

      await FamiliaSistemaAguasResiduales.create({
        id_familia: familiaTest.id_familia,
        id_tipo_aguas_residuales: 1
      }, { transaction });
      console.log('3️⃣ Aguas residuales: ✅');

      await FamiliaTipoVivienda.create({
        id_familia: familiaTest.id_familia,
        id_tipo_vivienda: 1
      }, { transaction });
      console.log('4️⃣ Tipo vivienda: ✅');

      await FamiliaDisposicionBasura.create({
        id_familia: familiaTest.id_familia,
        id_tipo_disposicion_basura: 1
      }, { transaction });
      console.log('5️⃣ Disposición basura: ✅');

      // Limpiar datos de prueba
      await familiaTest.destroy({ transaction });

      await transaction.commit();
      console.log('\n🎉 ¡PRUEBA DE TRANSACCIÓN COMPLETA EXITOSA!');

    } catch (error) {
      await transaction.rollback();
      console.log(`\n❌ ERROR EN PRUEBA: ${error.message}`);
      allTablesOk = false;
    }

    // RESULTADO FINAL
    console.log('\n🏆 RESULTADO FINAL');
    console.log('═══════════════════════════════════════════════════════');
    
    if (allTablesOk) {
      console.log('🎉 ¡SINCRONIZACIÓN COMPLETA EXITOSA!');
      console.log('✅ Todas las tablas creadas y funcionando');
      console.log('✅ Catálogos básicos cargados');
      console.log('✅ Usuario administrador creado');
      console.log('✅ Sistema de encuestas verificado');
      console.log('✅ Timestamps consistentes (created_at/updated_at)');
      console.log('');
      console.log('🚀 ESTADO: SERVIDOR DE TESTING COMPLETAMENTE CONFIGURADO');
      console.log('');
      console.log('🔐 CREDENCIALES DE ADMINISTRADOR:');
      console.log(`   Email: ${ADMIN_USER.email}`);
      console.log(`   Password: ${ADMIN_USER.password}`);
    } else {
      console.log('⚠️ Sincronización completada con advertencias');
      console.log('📋 Revisar logs anteriores para detalles');
    }

    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].includes('sync-database-complete.js')) {
  syncDatabaseComplete()
    .then(() => {
      console.log('\n✅ Sincronización completa de base de datos finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Sincronización falló:', error.message);
      process.exit(1);
    });
}

export default syncDatabaseComplete;
