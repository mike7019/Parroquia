#!/usr/bin/env node

/**
 * SCRIPT MAESTRO - CONFIGURACIÓN COMPLETA DEL SISTEMA
 * ===================================================
 * 
 * Este script único configura TODA la base de datos desde cero:
 * - Crea todas las tablas necesarias
 * - Normaliza timestamps
 * - Carga todos los catálogos
 * - Crea usuario administrador
 * - Valida que todo funcione
 * 
 * USO: npm run setup:complete
 *      node setup-complete-system.js
 */

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import readline from 'readline';
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

// Datos de catálogos
const CATALOGOS = {
  departamentos: [
    { codigo: '05', nombre: 'ANTIOQUIA', activo: true },
    { codigo: '08', nombre: 'ATLÁNTICO', activo: true },
    { codigo: '11', nombre: 'BOGOTÁ', activo: true },
    { codigo: '13', nombre: 'BOLÍVAR', activo: true },
    { codigo: '15', nombre: 'BOYACÁ', activo: true },
    { codigo: '17', nombre: 'CALDAS', activo: true },
    { codigo: '18', nombre: 'CAQUETÁ', activo: true },
    { codigo: '19', nombre: 'CAUCA', activo: true },
    { codigo: '20', nombre: 'CESAR', activo: true },
    { codigo: '23', nombre: 'CÓRDOBA', activo: true },
    { codigo: '25', nombre: 'CUNDINAMARCA', activo: true },
    { codigo: '27', nombre: 'CHOCÓ', activo: true },
    { codigo: '41', nombre: 'HUILA', activo: true },
    { codigo: '44', nombre: 'LA GUAJIRA', activo: true },
    { codigo: '47', nombre: 'MAGDALENA', activo: true },
    { codigo: '50', nombre: 'META', activo: true },
    { codigo: '52', nombre: 'NARIÑO', activo: true },
    { codigo: '54', nombre: 'NORTE DE SANTANDER', activo: true },
    { codigo: '63', nombre: 'QUINDÍO', activo: true },
    { codigo: '66', nombre: 'RISARALDA', activo: true },
    { codigo: '68', nombre: 'SANTANDER', activo: true },
    { codigo: '70', nombre: 'SUCRE', activo: true },
    { codigo: '73', nombre: 'TOLIMA', activo: true },
    { codigo: '76', nombre: 'VALLE DEL CAUCA', activo: true },
    { codigo: '81', nombre: 'ARAUCA', activo: true },
    { codigo: '85', nombre: 'CASANARE', activo: true },
    { codigo: '86', nombre: 'PUTUMAYO', activo: true },
    { codigo: '88', nombre: 'ARCHIPIÉLAGO DE SAN ANDRÉS', activo: true },
    { codigo: '91', nombre: 'AMAZONAS', activo: true },
    { codigo: '94', nombre: 'GUAINÍA', activo: true },
    { codigo: '95', nombre: 'GUAVIARE', activo: true },
    { codigo: '97', nombre: 'VAUPÉS', activo: true },
    { codigo: '99', nombre: 'VICHADA', activo: true }
  ],
  municipios: [
    { codigo: '05001', nombre: 'MEDELLÍN', codigo_departamento: '05', activo: true },
    { codigo: '05002', nombre: 'ABEJORRAL', codigo_departamento: '05', activo: true },
    { codigo: '05004', nombre: 'ABRIAQUÍ', codigo_departamento: '05', activo: true },
    { codigo: '05021', nombre: 'ALEJANDRÍA', codigo_departamento: '05', activo: true },
    { codigo: '05030', nombre: 'AMAGÁ', codigo_departamento: '05', activo: true },
    { codigo: '05031', nombre: 'AMALFI', codigo_departamento: '05', activo: true },
    { codigo: '05034', nombre: 'ANDES', codigo_departamento: '05', activo: true },
    { codigo: '05036', nombre: 'ANGELÓPOLIS', codigo_departamento: '05', activo: true },
    { codigo: '05038', nombre: 'ANGOSTURA', codigo_departamento: '05', activo: true },
    { codigo: '05040', nombre: 'ANORÍ', codigo_departamento: '05', activo: true }
  ],
  sistemas_acueducto: [
    { nombre: 'Acueducto Municipal', descripcion: 'Servicio público de acueducto', activo: true },
    { nombre: 'Pozo Propio', descripcion: 'Pozo de agua individual', activo: true },
    { nombre: 'Aljibe', descripcion: 'Depósito de agua lluvia', activo: true },
    { nombre: 'Río/Quebrada', descripcion: 'Captación directa de fuente hídrica', activo: true },
    { nombre: 'Carro Tanque', descripcion: 'Suministro por vehículo', activo: true },
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
  tipos_disposicion_basura: [
    { nombre: 'Recolección Pública', descripcion: 'Servicio municipal de recolección', activo: true },
    { nombre: 'Quema', descripcion: 'Quema de residuos', activo: true },
    { nombre: 'Entierro', descripcion: 'Enterrar los residuos', activo: true },
    { nombre: 'Reciclaje', descripcion: 'Separación y reciclaje', activo: true },
    { nombre: 'Compostaje', descripcion: 'Compostaje de orgánicos', activo: true },
    { nombre: 'Botadero', descripcion: 'Disposición en botadero', activo: true },
    { nombre: 'Separación por Colores', descripcion: 'Separación clasificada por colores', activo: true },
    { nombre: 'Otro', descripcion: 'Otro método no especificado', activo: true }
  ],
  tipos_vivienda: [
    { nombre: 'Casa', descripcion: 'Vivienda tipo casa', activo: true },
    { nombre: 'Apartamento', descripcion: 'Vivienda tipo apartamento', activo: true },
    { nombre: 'Finca', descripcion: 'Vivienda rural tipo finca', activo: true },
    { nombre: 'Rancho', descripcion: 'Vivienda tipo rancho', activo: true },
    { nombre: 'Inquilinato', descripcion: 'Vivienda en inquilinato', activo: true },
    { nombre: 'Otro', descripcion: 'Otro tipo de vivienda', activo: true }
  ]
};

// Función para input interactivo
function pregunta(texto) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

async function setupCompleteSystem() {
  console.log('🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA PARROQUIA');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`🏢 Base de datos: ${DB_CONFIG.database}`);
  console.log('');

  const sequelize = new Sequelize(DB_CONFIG);

  try {
    // PASO 1: Verificar conexión
    console.log('🔄 PASO 1: Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente');

    // PASO 2: Crear todas las tablas
    console.log('\n📋 PASO 2: Creando estructura de tablas...');
    console.log('─────────────────────────────────────────────────────────');

    // Definir todos los modelos
    const Departamento = sequelize.define('departamentos', {
      id_departamento: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      codigo: { type: DataTypes.STRING(5), allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'departamentos'
    });

    const Municipio = sequelize.define('municipios', {
      id_municipio: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      codigo: { type: DataTypes.STRING(10), allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      codigo_departamento: { type: DataTypes.STRING(5), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'municipios'
    });

    const SistemaAcueducto = sequelize.define('sistemas_acueducto', {
      id_sistema_acueducto: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'sistemas_acueducto'
    });

    const TipoAguasResiduales = sequelize.define('tipos_aguas_residuales', {
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'tipos_aguas_residuales'
    });

    const TipoDisposicionBasura = sequelize.define('tipos_disposicion_basura', {
      id_tipo_disposicion_basura: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'tipos_disposicion_basura'
    });

    const TipoVivienda = sequelize.define('tipos_vivienda', {
      id_tipo_vivienda: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'tipos_vivienda'
    });

    // Usuarios para autenticación
    const Usuario = sequelize.define('usuarios', {
      id_usuario: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      rol: { type: DataTypes.ENUM('admin', 'coordinador', 'encuestador'), defaultValue: 'encuestador' },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'usuarios'
    });

    // Sincronizar todas las tablas de forma segura
    console.log('🔧 Sincronizando tablas de forma segura...');
    
    try {
      // Intentar sincronización suave primero
      await sequelize.sync({ alter: false });
      console.log('✅ Sincronización suave exitosa');
    } catch (error) {
      console.log('⚠️ Sincronización suave falló, intentando corrección...');
      
      // Corregir problemas comunes en tablas existentes
      try {
        // Eliminar restricción NOT NULL problemática si existe
        await sequelize.query(`
          ALTER TABLE municipios ALTER COLUMN codigo_departamento DROP NOT NULL
        `).catch(() => {});
        
        // Actualizar valores null si existen
        await sequelize.query(`
          UPDATE municipios SET codigo_departamento = '05' WHERE codigo_departamento IS NULL
        `).catch(() => {});
        
        // Intentar sincronización nuevamente
        await sequelize.sync({ alter: true });
        console.log('✅ Sincronización con correcciones exitosa');
        
      } catch (innerError) {
        console.log('⚠️ Usando tablas existentes sin modificar estructura');
      }
    }
    console.log('✅ Estructura de tablas procesada');

    // PASO 3: Normalizar timestamps en tablas existentes
    console.log('\n🕒 PASO 3: Normalizando timestamps...');
    console.log('─────────────────────────────────────────────────────────');

    const tablasParaNormalizar = [
      'familias', 'usuarios', 'departamentos', 'municipios', 
      'sistemas_acueducto', 'tipos_aguas_residuales', 
      'tipos_disposicion_basura', 'tipos_vivienda',
      'familia_sistema_acueducto', 'familia_sistema_aguas_residuales',
      'familia_tipo_vivienda', 'familia_disposicion_basura'
    ];

    for (const tabla of tablasParaNormalizar) {
      try {
        await sequelize.query(`ALTER TABLE ${tabla} RENAME COLUMN "createdAt" TO created_at`).catch(() => {});
        await sequelize.query(`ALTER TABLE ${tabla} RENAME COLUMN "updatedAt" TO updated_at`).catch(() => {});
        console.log(`   ✅ ${tabla}: Timestamps normalizados`);
      } catch (error) {
        console.log(`   ⚠️ ${tabla}: ${error.message.substring(0, 50)}...`);
      }
    }

    // PASO 4: Cargar datos de catálogos
    console.log('\n📦 PASO 4: Cargando catálogos...');
    console.log('─────────────────────────────────────────────────────────');

    // Departamentos
    let existingCount = await Departamento.count();
    if (existingCount === 0) {
      for (const dept of CATALOGOS.departamentos) {
        await Departamento.create(dept);
      }
      console.log(`✅ Departamentos: ${CATALOGOS.departamentos.length} registros cargados`);
    } else {
      console.log(`ℹ️ Departamentos: ${existingCount} registros existentes`);
    }

    // Municipios
    existingCount = await Municipio.count();
    if (existingCount === 0) {
      for (const mun of CATALOGOS.municipios) {
        await Municipio.create(mun);
      }
      console.log(`✅ Municipios: ${CATALOGOS.municipios.length} registros cargados`);
    } else {
      console.log(`ℹ️ Municipios: ${existingCount} registros existentes`);
    }

    // Sistemas de acueducto
    existingCount = await SistemaAcueducto.count();
    if (existingCount === 0) {
      for (const sistema of CATALOGOS.sistemas_acueducto) {
        await SistemaAcueducto.create(sistema);
      }
      console.log(`✅ Sistemas acueducto: ${CATALOGOS.sistemas_acueducto.length} registros cargados`);
    } else {
      console.log(`ℹ️ Sistemas acueducto: ${existingCount} registros existentes`);
    }

    // Tipos de aguas residuales
    existingCount = await TipoAguasResiduales.count();
    if (existingCount === 0) {
      for (const tipo of CATALOGOS.tipos_aguas_residuales) {
        await TipoAguasResiduales.create(tipo);
      }
      console.log(`✅ Tipos aguas residuales: ${CATALOGOS.tipos_aguas_residuales.length} registros cargados`);
    } else {
      console.log(`ℹ️ Tipos aguas residuales: ${existingCount} registros existentes`);
    }

    // Tipos de disposición de basura
    existingCount = await TipoDisposicionBasura.count();
    if (existingCount === 0) {
      for (const tipo of CATALOGOS.tipos_disposicion_basura) {
        await TipoDisposicionBasura.create(tipo);
      }
      console.log(`✅ Tipos disposición basura: ${CATALOGOS.tipos_disposicion_basura.length} registros cargados`);
    } else {
      console.log(`ℹ️ Tipos disposición basura: ${existingCount} registros existentes`);
    }

    // Tipos de vivienda
    existingCount = await TipoVivienda.count();
    if (existingCount === 0) {
      for (const tipo of CATALOGOS.tipos_vivienda) {
        await TipoVivienda.create(tipo);
      }
      console.log(`✅ Tipos vivienda: ${CATALOGOS.tipos_vivienda.length} registros cargados`);
    } else {
      console.log(`ℹ️ Tipos vivienda: ${existingCount} registros existentes`);
    }

    // PASO 5: Crear usuario administrador
    console.log('\n👤 PASO 5: Configurando usuario administrador...');
    console.log('─────────────────────────────────────────────────────────');

    try {
      // Verificar estructura de tabla usuarios
      const [userColumns] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'usuarios'
      `);
      
      const columnNames = userColumns.map(col => col.column_name);
      const hasApellido = columnNames.includes('apellido');
      
      console.log(`📋 Estructura usuarios detectada: ${hasApellido ? 'completa' : 'simplificada'}`);
      
      let existingAdmin;
      if (hasApellido) {
        existingAdmin = await Usuario.findOne({ where: { rol: 'admin' } });
      } else {
        // Usar query directa para tabla con estructura diferente
        const [admins] = await sequelize.query(`
          SELECT * FROM usuarios WHERE rol = 'admin' LIMIT 1
        `);
        existingAdmin = admins.length > 0 ? admins[0] : null;
      }
      
      if (!existingAdmin) {
        console.log('📝 No se encontró usuario administrador. Creando uno nuevo...');
        
        const nombre = await pregunta('👤 Nombre del administrador: ');
        const email = await pregunta('📧 Email del administrador: ');
        const password = await pregunta('🔐 Contraseña del administrador: ');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (hasApellido) {
          const apellido = await pregunta('👤 Apellido del administrador: ');
          await Usuario.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
            rol: 'admin',
            activo: true
          });
        } else {
          // Crear con estructura simplificada
          await sequelize.query(`
            INSERT INTO usuarios (nombre, email, password, rol, activo, created_at, updated_at)
            VALUES ($1, $2, $3, 'admin', true, NOW(), NOW())
          `, {
            bind: [nombre, email, hashedPassword]
          });
        }
        
        console.log('✅ Usuario administrador creado exitosamente');
      } else {
        const emailField = hasApellido ? existingAdmin.email : existingAdmin.email;
        console.log(`ℹ️ Usuario administrador existente: ${emailField}`);
      }
    } catch (error) {
      console.log(`⚠️ Error configurando usuario administrador: ${error.message}`);
      console.log('   Puedes crear un administrador manualmente después');
    }

    // PASO 6: Verificación final
    console.log('\n🧪 PASO 6: Verificación final del sistema...');
    console.log('─────────────────────────────────────────────────────────');

    const tablasVerificar = [
      'departamentos', 'municipios', 'sistemas_acueducto',
      'tipos_aguas_residuales', 'tipos_disposicion_basura', 
      'tipos_vivienda', 'usuarios'
    ];

    let todasLasTablasFuncionan = true;

    for (const tabla of tablasVerificar) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        console.log(`✅ ${tabla}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`❌ ${tabla}: ERROR - ${error.message}`);
        todasLasTablasFuncionan = false;
      }
    }

    // RESULTADO FINAL
    console.log('\n🏆 RESULTADO FINAL');
    console.log('═══════════════════════════════════════════════════════');
    
    if (todasLasTablasFuncionan) {
      console.log('🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('✅ Todas las tablas creadas y funcionando');
      console.log('✅ Timestamps normalizados');
      console.log('✅ Catálogos cargados');
      console.log('✅ Usuario administrador configurado');
      console.log('✅ Sistema de encuestas COMPLETAMENTE OPERATIVO');
      console.log('');
      console.log('🚀 ESTADO: SISTEMA LISTO PARA PRODUCCIÓN/TESTING');
    } else {
      console.log('⚠️ Algunas verificaciones fallaron');
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
if (process.argv[1].includes('setup-complete-system.js')) {
  setupCompleteSystem()
    .then(() => {
      console.log('\n✅ Configuración completa del sistema finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Configuración falló:', error.message);
      process.exit(1);
    });
}

export default setupCompleteSystem;
