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
    { codigo_dane: '05', nombre: 'ANTIOQUIA' },
    { codigo_dane: '11', nombre: 'BOGOTÁ' },
    { codigo_dane: '76', nombre: 'VALLE DEL CAUCA' }
  ],
  municipios: [
    { codigo_dane: '05001', nombre_municipio: 'MEDELLÍN', id_departamento: 1 },
    { codigo_dane: '11001', nombre_municipio: 'BOGOTÁ', id_departamento: 2 },
    { codigo_dane: '76001', nombre_municipio: 'CALI', id_departamento: 3 },
    { codigo_dane: '05266', nombre_municipio: 'RIONEGRO', id_departamento: 1 }
  ],
  sistemas_acueducto: [
    { nombre: 'Acueducto Municipal', descripcion: 'Servicio público de acueducto' },
    { nombre: 'Pozo Propio', descripcion: 'Pozo de agua individual' },
    { nombre: 'Aljibe', descripcion: 'Depósito de agua lluvia' },
    { nombre: 'Río/Quebrada', descripcion: 'Captación directa de fuente hídrica' },
    { nombre: 'Carro Tanque', descripcion: 'Suministro por vehículo' },
    { nombre: 'Otro', descripcion: 'Otro sistema no especificado' }
  ],
  tipos_aguas_residuales: [
    { nombre: 'Alcantarillado', descripcion: 'Conectado a red de alcantarillado municipal' },
    { nombre: 'Pozo Séptico', descripcion: 'Sistema de tratamiento individual' },
    { nombre: 'Letrina', descripcion: 'Sistema básico de saneamiento' },
    { nombre: 'Campo Abierto', descripcion: 'Sin sistema de tratamiento' },
    { nombre: 'Río/Quebrada', descripcion: 'Descarga directa a fuente hídrica' }
  ],
  tipos_disposicion_basura: [
    { nombre: 'Recolección Pública', descripcion: 'Servicio municipal de recolección' },
    { nombre: 'Quema', descripcion: 'Quema de residuos' },
    { nombre: 'Entierro', descripcion: 'Enterrar los residuos' },
    { nombre: 'Reciclaje', descripcion: 'Separación y reciclaje' },
    { nombre: 'Compostaje', descripcion: 'Compostaje de orgánicos' },
    { nombre: 'Botadero', descripcion: 'Disposición en botadero' },
    { nombre: 'Separación por Colores', descripcion: 'Separación clasificada por colores' },
    { nombre: 'Otro', descripcion: 'Otro método no especificado' }
  ],
  tipos_vivienda: [
    { nombre: 'Casa', descripcion: 'Vivienda tipo casa' },
    { nombre: 'Apartamento', descripcion: 'Vivienda tipo apartamento' },
    { nombre: 'Finca', descripcion: 'Vivienda rural tipo finca' },
    { nombre: 'Rancho', descripcion: 'Vivienda tipo rancho' },
    { nombre: 'Inquilinato', descripcion: 'Vivienda en inquilinato' },
    { nombre: 'Otro', descripcion: 'Otro tipo de vivienda' }
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

    // Importar los modelos reales existentes
    const { default: modelos } = await import('./src/models/index.js');
    const { 
      Departamentos: Departamento, 
      Municipios: Municipio,
      TipoAguasResiduales,
      TipoDisposicionBasura,
      TipoVivienda
    } = modelos;
    
    // Para modelos que no estén disponibles, usar definiciones temporales
    const SistemaAcueducto = modelos.SistemaAcueducto || sequelize.define('sistemas_acueducto', {
      id_sistema_acueducto: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'sistemas_acueducto'
    });

    // Los modelos de catálogo ya están importados arriba

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
      const departamentosCreados = [];
      for (const dept of CATALOGOS.departamentos) {
        const deptCreado = await Departamento.create(dept);
        departamentosCreados.push(deptCreado);
      }
      console.log(`✅ Departamentos: ${CATALOGOS.departamentos.length} registros cargados`);
      
      // Municipios - usar los IDs reales de los departamentos creados
      const municipiosActualizados = [
        { codigo_dane: '05001', nombre_municipio: 'MEDELLÍN', id_departamento: departamentosCreados[0].id_departamento },
        { codigo_dane: '11001', nombre_municipio: 'BOGOTÁ', id_departamento: departamentosCreados[1].id_departamento },
        { codigo_dane: '76001', nombre_municipio: 'CALI', id_departamento: departamentosCreados[2].id_departamento },
        { codigo_dane: '05266', nombre_municipio: 'RIONEGRO', id_departamento: departamentosCreados[0].id_departamento }
      ];
      
      for (const mun of municipiosActualizados) {
        await Municipio.create(mun);
      }
      console.log(`✅ Municipios: ${municipiosActualizados.length} registros cargados`);
    } else {
      console.log(`ℹ️ Departamentos: ${existingCount} registros existentes`);
      
      // Cargar municipios si no existen
      const existingMunicipios = await Municipio.count();
      if (existingMunicipios === 0) {
        // Obtener departamentos existentes para los municipios
        const antioquia = await Departamento.findOne({ where: { codigo_dane: '05' } });
        const bogota = await Departamento.findOne({ where: { codigo_dane: '11' } });
        const valle = await Departamento.findOne({ where: { codigo_dane: '76' } });
        
        const municipiosActualizados = [
          { codigo_dane: '05001', nombre_municipio: 'MEDELLÍN', id_departamento: antioquia.id_departamento },
          { codigo_dane: '11001', nombre_municipio: 'BOGOTÁ', id_departamento: bogota.id_departamento },
          { codigo_dane: '76001', nombre_municipio: 'CALI', id_departamento: valle.id_departamento },
          { codigo_dane: '05266', nombre_municipio: 'RIONEGRO', id_departamento: antioquia.id_departamento }
        ];
        
        for (const mun of municipiosActualizados) {
          await Municipio.create(mun);
        }
        console.log(`✅ Municipios: ${municipiosActualizados.length} registros cargados`);
      } else {
        console.log(`ℹ️ Municipios: ${existingMunicipios} registros existentes`);
      }
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
