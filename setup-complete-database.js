#!/usr/bin/env node

/**
 * SCRIPT DE CONFIGURACIÓN COMPLETA DE BASE DE DATOS
 * ================================================
 * 
 * Este script configura una base de datos completamente limpia con:
 * - Todas las tablas necesarias
 * - Datos de catálogos básicos
 * - Estructura completa para el sistema de encuestas
 * - Usuario administrador por defecto
 * 
 * USO:
 * npm run setup:database
 * o
 * node setup-complete-database.js
 * 
 * REQUISITOS:
 * - PostgreSQL corriendo
 * - Variables de entorno configuradas en .env
 * - Base de datos creada (pero puede estar vacía)
 */

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de base de datos
const DB_CONFIG = {
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false, // Cambiar a console.log para ver queries SQL
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Datos de catálogos básicos
const CATALOG_DATA = {
  departamentos: [
    { nombre: 'Antioquia', codigo: '05' },
    { nombre: 'Cundinamarca', codigo: '25' },
    { nombre: 'Valle del Cauca', codigo: '76' }
  ],
  
  municipios: [
    { nombre: 'Medellín', codigo: '05001', id_departamento: 1 },
    { nombre: 'Envigado', codigo: '05266', id_departamento: 1 },
    { nombre: 'Bogotá D.C.', codigo: '25001', id_departamento: 2 },
    { nombre: 'Cali', codigo: '76001', id_departamento: 3 }
  ],

  parroquias: [
    { nombre: 'San José', id_municipio: 1 },
    { nombre: 'Sagrado Corazón', id_municipio: 1 },
    { nombre: 'Nuestra Señora de Fátima', id_municipio: 2 },
    { nombre: 'La Inmaculada', id_municipio: 3 },
    { nombre: 'San Francisco', id_municipio: 4 }
  ],

  sectores: [
    { nombre: 'Centro', id_parroquia: 1 },
    { nombre: 'Norte', id_parroquia: 1 },
    { nombre: 'Sur', id_parroquia: 2 },
    { nombre: 'Occidental', id_parroquia: 3 }
  ],

  veredas: [
    { nombre: 'La Esperanza', id_sector: 1 },
    { nombre: 'El Progreso', id_sector: 1 },
    { nombre: 'San Antonio', id_sector: 2 },
    { nombre: 'Las Flores', id_sector: 3 }
  ],

  sistemas_acueducto: [
    { descripcion: 'Acueducto Municipal', activo: true },
    { descripcion: 'Pozo Propio', activo: true },
    { descripcion: 'Agua Lluvia', activo: true },
    { descripcion: 'Carrotanque', activo: true },
    { descripcion: 'Nacimiento', activo: true },
    { descripcion: 'Otro', activo: true }
  ],

  tipos_vivienda: [
    { descripcion: 'Casa Propia', activo: true },
    { descripcion: 'Casa Familiar', activo: true },
    { descripcion: 'Casa Arrendada', activo: true },
    { descripcion: 'Apartamento', activo: true },
    { descripcion: 'Cuarto', activo: true },
    { descripcion: 'Otro', activo: true }
  ],

  estados_civiles: [
    { descripcion: 'Soltero(a)', activo: true },
    { descripcion: 'Casado(a)', activo: true },
    { descripcion: 'Unión Libre', activo: true },
    { descripcion: 'Divorciado(a)', activo: true },
    { descripcion: 'Viudo(a)', activo: true },
    { descripcion: 'Separado(a)', activo: true }
  ],

  enfermedades: [
    { descripcion: 'Diabetes', activo: true },
    { descripcion: 'Hipertensión', activo: true },
    { descripcion: 'Cardiopatía', activo: true },
    { descripcion: 'Asma', activo: true },
    { descripcion: 'Artritis', activo: true },
    { descripcion: 'Otra', activo: true }
  ]
};

class DatabaseSetup {
  constructor() {
    this.sequelize = new Sequelize(DB_CONFIG);
    this.models = {};
  }

  async initialize() {
    console.log('🚀 INICIANDO CONFIGURACIÓN COMPLETA DE BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`🏢 Base de datos: ${DB_CONFIG.database}`);
    console.log(`🌐 Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`👤 Usuario: ${DB_CONFIG.username}`);
    console.log('');

    try {
      // 1. Verificar conexión
      await this.testConnection();
      
      // 2. Crear todas las tablas
      await this.createAllTables();
      
      // 3. Sincronizar modelos
      await this.syncDatabase();
      
      // 4. Cargar datos de catálogos
      await this.loadCatalogData();
      
      // 5. Crear usuario administrador
      await this.createAdminUser();
      
      // 6. Verificación final
      await this.finalVerification();
      
      console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ Base de datos completamente configurada');
      console.log('✅ Todas las tablas creadas');
      console.log('✅ Datos de catálogos cargados');
      console.log('✅ Usuario administrador creado');
      console.log('✅ Sistema listo para usar');
      
    } catch (error) {
      console.error('\n❌ ERROR EN LA CONFIGURACIÓN:', error.message);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  async testConnection() {
    console.log('🔄 Verificando conexión a base de datos...');
    try {
      await this.sequelize.authenticate();
      console.log('✅ Conexión establecida correctamente');
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
      throw error;
    }
  }

  async createAllTables() {
    console.log('\n🏗️ CREANDO ESTRUCTURA DE TABLAS...');
    console.log('═══════════════════════════════════════════════════════');

    // Definir todos los modelos
    await this.defineModels();
    
    console.log('✅ Todos los modelos definidos');
  }

  async defineModels() {
    // 1. Tablas de catálogos geográficos
    this.models.Departamento = this.sequelize.define('departamentos', {
      id_departamento: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      codigo: { type: DataTypes.STRING(10) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.Municipio = this.sequelize.define('municipios', {
      id_municipio: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      codigo: { type: DataTypes.STRING(10) },
      id_departamento: { type: DataTypes.BIGINT, references: { model: 'departamentos', key: 'id_departamento' }},
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.Parroquia = this.sequelize.define('parroquias', {
      id_parroquia: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      id_municipio: { type: DataTypes.BIGINT, references: { model: 'municipios', key: 'id_municipio' }}
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.Sector = this.sequelize.define('sectores', {
      id_sector: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      id_parroquia: { type: DataTypes.BIGINT, references: { model: 'parroquias', key: 'id_parroquia' }},
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.Vereda = this.sequelize.define('veredas', {
      id_vereda: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      id_sector: { type: DataTypes.BIGINT, references: { model: 'sectores', key: 'id_sector' }},
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    // 2. Catálogos generales
    this.models.SistemaAcueducto = this.sequelize.define('sistemas_acueducto', {
      id_sistema: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(100), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.TipoVivienda = this.sequelize.define('tipos_vivienda', {
      id_tipo: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(100), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.EstadoCivil = this.sequelize.define('estados_civiles', {
      id_estado: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(50), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.Enfermedad = this.sequelize.define('enfermedades', {
      id_enfermedad: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(100), allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    // 3. Tabla principal de familias
    this.models.Familia = this.sequelize.define('familias', {
      id_familia: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      apellido_familiar: { type: DataTypes.STRING(100) },
      sector: { type: DataTypes.STRING(100) },
      direccion_familia: { type: DataTypes.STRING(200) },
      numero_contacto: { type: DataTypes.STRING(20) },
      telefono: { type: DataTypes.STRING(20) },
      email: { type: DataTypes.STRING(100) },
      tamaño_familia: { type: DataTypes.INTEGER, defaultValue: 0 },
      tipo_vivienda: { type: DataTypes.STRING(50) },
      estado_encuesta: { type: DataTypes.STRING(50), defaultValue: 'pendiente' },
      numero_encuestas: { type: DataTypes.INTEGER, defaultValue: 0 },
      fecha_ultima_encuesta: { type: DataTypes.DATE },
      codigo_familia: { type: DataTypes.STRING(50) },
      tutor_responsable: { type: DataTypes.BOOLEAN, defaultValue: false },
      id_municipio: { type: DataTypes.BIGINT },
      id_vereda: { type: DataTypes.BIGINT },
      id_sector: { type: DataTypes.BIGINT },
      comunionEnCasa: { type: DataTypes.BOOLEAN, defaultValue: false },
      numero_contrato_epm: { type: DataTypes.STRING(50) }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    // 4. Tabla de personas
    this.models.Persona = this.sequelize.define('personas', {
      id_personas: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      primer_nombre: { type: DataTypes.STRING(50) },
      segundo_nombre: { type: DataTypes.STRING(50) },
      primer_apellido: { type: DataTypes.STRING(50) },
      segundo_apellido: { type: DataTypes.STRING(50) },
      id_tipo_identificacion_tipo_identificacion: { type: DataTypes.BIGINT },
      identificacion: { type: DataTypes.STRING(20) },
      telefono: { type: DataTypes.STRING(20) },
      correo_electronico: { type: DataTypes.STRING(100) },
      fecha_nacimiento: { type: DataTypes.DATE },
      direccion: { type: DataTypes.STRING(200) },
      id_familia_familias: { type: DataTypes.BIGINT },
      id_estado_civil_estado_civil: { type: DataTypes.BIGINT },
      estudios: { type: DataTypes.STRING(100) },
      en_que_eres_lider: { type: DataTypes.STRING(200) },
      necesidad_enfermo: { type: DataTypes.STRING(200) },
      id_profesion: { type: DataTypes.BIGINT },
      id_sexo: { type: DataTypes.BIGINT },
      talla_camisa: { type: DataTypes.STRING(10) },
      talla_pantalon: { type: DataTypes.STRING(10) },
      talla_zapato: { type: DataTypes.STRING(10) },
      id_familia: { type: DataTypes.BIGINT },
      id_parroquia: { type: DataTypes.BIGINT }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    // 5. Tablas de relación (junction tables) - CRÍTICAS PARA ENCUESTAS
    this.models.FamiliaSistemaAcueducto = this.sequelize.define('familia_sistema_acueducto', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_sistema_acueducto: { type: DataTypes.BIGINT, allowNull: false }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    this.models.FamiliaTipoVivienda = this.sequelize.define('familia_tipo_vivienda', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_vivienda: { type: DataTypes.BIGINT, allowNull: false }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    // 6. Tabla de usuarios
    this.models.Usuario = this.sequelize.define('usuarios', {
      id_usuario: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      rol: { type: DataTypes.STRING(50), defaultValue: 'user' },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    console.log('📋 Modelos definidos: 12 tablas principales');
  }

  async syncDatabase() {
    console.log('\n🔄 Sincronizando base de datos...');
    
    // Eliminar todas las tablas existentes y recrearlas
    await this.sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada (tablas recreadas)');
  }

  async loadCatalogData() {
    console.log('\n📊 CARGANDO DATOS DE CATÁLOGOS...');
    console.log('═══════════════════════════════════════════════════════');

    try {
      // 1. Departamentos
      console.log('🌍 Cargando departamentos...');
      for (const dept of CATALOG_DATA.departamentos) {
        await this.models.Departamento.create(dept);
      }
      console.log(`✅ ${CATALOG_DATA.departamentos.length} departamentos cargados`);

      // 2. Municipios
      console.log('🏙️ Cargando municipios...');
      for (const mun of CATALOG_DATA.municipios) {
        await this.models.Municipio.create(mun);
      }
      console.log(`✅ ${CATALOG_DATA.municipios.length} municipios cargados`);

      // 3. Parroquias
      console.log('⛪ Cargando parroquias...');
      for (const par of CATALOG_DATA.parroquias) {
        await this.models.Parroquia.create(par);
      }
      console.log(`✅ ${CATALOG_DATA.parroquias.length} parroquias cargadas`);

      // 4. Sectores
      console.log('📍 Cargando sectores...');
      for (const sec of CATALOG_DATA.sectores) {
        await this.models.Sector.create(sec);
      }
      console.log(`✅ ${CATALOG_DATA.sectores.length} sectores cargados`);

      // 5. Veredas
      console.log('🏘️ Cargando veredas...');
      for (const ver of CATALOG_DATA.veredas) {
        await this.models.Vereda.create(ver);
      }
      console.log(`✅ ${CATALOG_DATA.veredas.length} veredas cargadas`);

      // 6. Sistemas de acueducto
      console.log('💧 Cargando sistemas de acueducto...');
      for (const sis of CATALOG_DATA.sistemas_acueducto) {
        await this.models.SistemaAcueducto.create(sis);
      }
      console.log(`✅ ${CATALOG_DATA.sistemas_acueducto.length} sistemas de acueducto cargados`);

      // 7. Tipos de vivienda
      console.log('🏠 Cargando tipos de vivienda...');
      for (const tipo of CATALOG_DATA.tipos_vivienda) {
        await this.models.TipoVivienda.create(tipo);
      }
      console.log(`✅ ${CATALOG_DATA.tipos_vivienda.length} tipos de vivienda cargados`);

      // 8. Estados civiles
      console.log('💑 Cargando estados civiles...');
      for (const estado of CATALOG_DATA.estados_civiles) {
        await this.models.EstadoCivil.create(estado);
      }
      console.log(`✅ ${CATALOG_DATA.estados_civiles.length} estados civiles cargados`);

      // 9. Enfermedades
      console.log('🏥 Cargando enfermedades...');
      for (const enf of CATALOG_DATA.enfermedades) {
        await this.models.Enfermedad.create(enf);
      }
      console.log(`✅ ${CATALOG_DATA.enfermedades.length} enfermedades cargadas`);

    } catch (error) {
      console.error('❌ Error cargando catálogos:', error.message);
      throw error;
    }
  }

  async createAdminUser() {
    console.log('\n👤 CREANDO USUARIO ADMINISTRADOR...');
    console.log('═══════════════════════════════════════════════════════');

    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await this.models.Usuario.create({
        nombre: 'Administrador',
        email: 'admin@parroquia.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });

      console.log('✅ Usuario administrador creado:');
      console.log(`   📧 Email: admin@parroquia.com`);
      console.log(`   🔑 Password: admin123`);
      console.log(`   👑 Rol: admin`);
      console.log('');
      console.log('⚠️  IMPORTANTE: Cambiar la contraseña en producción');

    } catch (error) {
      console.error('❌ Error creando usuario admin:', error.message);
      throw error;
    }
  }

  async finalVerification() {
    console.log('\n🧪 VERIFICACIÓN FINAL...');
    console.log('═══════════════════════════════════════════════════════');

    const tablesWithData = [
      { model: this.models.Departamento, name: 'departamentos' },
      { model: this.models.Municipio, name: 'municipios' },
      { model: this.models.Parroquia, name: 'parroquias' },
      { model: this.models.Sector, name: 'sectores' },
      { model: this.models.Vereda, name: 'veredas' },
      { model: this.models.SistemaAcueducto, name: 'sistemas_acueducto' },
      { model: this.models.TipoVivienda, name: 'tipos_vivienda' },
      { model: this.models.EstadoCivil, name: 'estados_civiles' },
      { model: this.models.Enfermedad, name: 'enfermedades' },
      { model: this.models.Usuario, name: 'usuarios' }
    ];

    let totalRecords = 0;

    for (const { model, name } of tablesWithData) {
      try {
        const count = await model.count();
        console.log(`✅ ${name}: ${count} registros`);
        totalRecords += count;
      } catch (error) {
        console.log(`❌ ${name}: Error - ${error.message}`);
      }
    }

    console.log(`\n📊 Total de registros cargados: ${totalRecords}`);
    console.log('✅ Estructura lista para recibir encuestas');
    console.log('✅ Tablas de relación creadas y preparadas');
  }
}

// Función principal
async function setupDatabase() {
  const setup = new DatabaseSetup();
  
  try {
    await setup.initialize();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 SETUP FAILED:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase();
}

export default setupDatabase;
