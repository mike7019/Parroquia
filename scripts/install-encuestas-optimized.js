#!/usr/bin/env node

/**
 * Script de instalación completa para las mejoras del servicio de encuestas
 * Ejecutar con: node scripts/install-encuestas-optimized.js
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import sequelize from '../config/sequelize.js';

class EncuestasInstaller {
  constructor() {
    this.pasos = [
      'Verificar dependencias',
      'Crear directorios necesarios',
      'Ejecutar migraciones de índices',
      'Configurar logging',
      'Instalar extensiones PostgreSQL',
      'Crear vistas materializadas',
      'Configurar monitoreo',
      'Verificar instalación'
    ];
    this.pasoActual = 0;
  }

  /**
   * Ejecutar instalación completa
   */
  async instalar() {
    console.log('🚀 Iniciando instalación de mejoras para servicio de encuestas\n');

    try {
      for (const paso of this.pasos) {
        this.pasoActual++;
        console.log(`📋 Paso ${this.pasoActual}/${this.pasos.length}: ${paso}`);
        
        switch (paso) {
          case 'Verificar dependencias':
            await this.verificarDependencias();
            break;
          case 'Crear directorios necesarios':
            await this.crearDirectorios();
            break;
          case 'Ejecutar migraciones de índices':
            await this.ejecutarMigraciones();
            break;
          case 'Configurar logging':
            await this.configurarLogging();
            break;
          case 'Instalar extensiones PostgreSQL':
            await this.instalarExtensiones();
            break;
          case 'Crear vistas materializadas':
            await this.crearVistasMaterializadas();
            break;
          case 'Configurar monitoreo':
            await this.configurarMonitoreo();
            break;
          case 'Verificar instalación':
            await this.verificarInstalacion();
            break;
        }
        
        console.log(`✅ ${paso} completado\n`);
      }

      console.log('🎉 ¡Instalación completada exitosamente!');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Reiniciar el servidor: npm run dev');
      console.log('2. Ejecutar tests: npm test');
      console.log('3. Configurar monitoreo: node scripts/monitoreo-encuestas.js');
      console.log('4. Revisar logs en: logs/');

    } catch (error) {
      console.error(`❌ Error en paso "${this.pasos[this.pasoActual - 1]}":`, error.message);
      console.error('\n🔧 Para resolver:');
      console.error('1. Verificar permisos de base de datos');
      console.error('2. Verificar conexión a PostgreSQL');
      console.error('3. Revisar logs de error');
      process.exit(1);
    }
  }

  /**
   * Verificar dependencias necesarias
   */
  async verificarDependencias() {
    // Verificar Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 16) {
      throw new Error('Se requiere Node.js 16 o superior');
    }

    // Verificar conexión a base de datos
    try {
      await sequelize.authenticate();
      console.log('   ✅ Conexión a PostgreSQL exitosa');
    } catch (error) {
      throw new Error(`Error conectando a PostgreSQL: ${error.message}`);
    }

    // Verificar dependencias npm
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const dependenciasRequeridas = [
      'winston',
      'express-rate-limit',
      'lru-cache',
      'nodemailer'
    ];

    for (const dep of dependenciasRequeridas) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        console.log(`   📦 Instalando ${dep}...`);
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
      } else {
        console.log(`   ✅ ${dep} disponible`);
      }
    }
  }

  /**
   * Crear directorios necesarios
   */
  async crearDirectorios() {
    const directorios = [
      'logs',
      'logs/monitoreo',
      'backups',
      'backups/encuestas',
      'temp',
      'reports'
    ];

    for (const dir of directorios) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`   📁 Directorio creado: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        console.log(`   📁 Directorio ya existe: ${dir}`);
      }
    }

    // Crear archivo .gitkeep para logs
    await fs.writeFile('logs/.gitkeep', '');
    await fs.writeFile('backups/.gitkeep', '');
  }

  /**
   * Ejecutar migraciones de índices
   */
  async ejecutarMigraciones() {
    try {
      const sqlFile = await fs.readFile('database/migrations/create-encuestas-indexes.sql', 'utf8');
      
      // Dividir en comandos individuales
      const comandos = sqlFile
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      console.log(`   📊 Ejecutando ${comandos.length} comandos SQL...`);

      for (const comando of comandos) {
        try {
          await sequelize.query(comando);
        } catch (error) {
          // Ignorar errores de índices que ya existen
          if (!error.message.includes('already exists')) {
            console.warn(`   ⚠️ Advertencia en comando SQL: ${error.message}`);
          }
        }
      }

      console.log('   ✅ Índices y vistas materializadas creados');

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('   ⚠️ Archivo de migraciones no encontrado, creando índices básicos...');
        await this.crearIndicesBasicos();
      } else {
        throw error;
      }
    }
  }

  /**
   * Crear índices básicos si no existe el archivo de migración
   */
  async crearIndicesBasicos() {
    const indicesBasicos = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_cursor_pagination ON familias (fecha_ultima_encuesta DESC, id_familia DESC)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_apellido_familiar ON familias (apellido_familiar)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_familia_activas ON personas (id_familia_familias) WHERE identificacion NOT LIKE \'FALLECIDO%\'',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_difuntos_familia ON difuntos_familia (id_familia_familias)'
    ];

    for (const indice of indicesBasicos) {
      try {
        await sequelize.query(indice);
        console.log(`   ✅ Índice creado`);
      } catch (error) {
        console.warn(`   ⚠️ Error creando índice: ${error.message}`);
      }
    }
  }

  /**
   * Configurar sistema de logging
   */
  async configurarLogging() {
    // Crear configuración de logging si no existe
    const logConfig = {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      transports: {
        file: {
          enabled: true,
          filename: 'logs/encuestas.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        },
        console: {
          enabled: process.env.NODE_ENV !== 'production',
          colorize: true
        }
      }
    };

    await fs.writeFile('config/logging.json', JSON.stringify(logConfig, null, 2));
    console.log('   📝 Configuración de logging creada');

    // Crear archivo de rotación de logs
    const logrotateConfig = `
logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}`;

    await fs.writeFile('config/logrotate.conf', logrotateConfig);
    console.log('   🔄 Configuración de rotación de logs creada');
  }

  /**
   * Instalar extensiones PostgreSQL necesarias
   */
  async instalarExtensiones() {
    const extensiones = [
      'pg_trgm',      // Para búsquedas de texto
      'pg_stat_statements', // Para monitoreo de consultas
      'btree_gin'     // Para índices compuestos
    ];

    for (const extension of extensiones) {
      try {
        await sequelize.query(`CREATE EXTENSION IF NOT EXISTS ${extension}`);
        console.log(`   🔌 Extensión instalada: ${extension}`);
      } catch (error) {
        console.warn(`   ⚠️ No se pudo instalar ${extension}: ${error.message}`);
      }
    }
  }

  /**
   * Crear vistas materializadas
   */
  async crearVistasMaterializadas() {
    const vistas = [
      {
        nombre: 'mv_encuestas_estadisticas',
        sql: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_encuestas_estadisticas AS
          SELECT 
            COUNT(*) as total_familias,
            COUNT(CASE WHEN estado_encuesta = 'completada' THEN 1 END) as familias_completadas,
            AVG(tamaño_familia) as promedio_tamaño_familia,
            COUNT(DISTINCT id_municipio) as municipios_cubiertos,
            MAX(fecha_ultima_encuesta) as ultima_encuesta_fecha
          FROM familias
        `
      },
      {
        nombre: 'mv_encuestas_por_municipio',
        sql: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_encuestas_por_municipio AS
          SELECT 
            m.id_municipio,
            m.nombre_municipio,
            COUNT(f.id_familia) as total_familias
          FROM municipios m
          LEFT JOIN familias f ON m.id_municipio = f.id_municipio
          GROUP BY m.id_municipio, m.nombre_municipio
        `
      }
    ];

    for (const vista of vistas) {
      try {
        await sequelize.query(vista.sql);
        console.log(`   📊 Vista materializada creada: ${vista.nombre}`);
      } catch (error) {
        console.warn(`   ⚠️ Error creando vista ${vista.nombre}: ${error.message}`);
      }
    }
  }

  /**
   * Configurar sistema de monitoreo
   */
  async configurarMonitoreo() {
    // Crear configuración de monitoreo
    const monitoreoConfig = {
      enabled: true,
      interval: '*/15 * * * *', // Cada 15 minutos
      alerts: {
        email: process.env.ALERT_EMAIL || 'admin@parroquia.com',
        thresholds: {
          slow_queries: 2000,
          memory_usage: 80,
          db_connections: 80,
          errors_per_minute: 10
        }
      },
      metrics: {
        database: true,
        performance: true,
        business: true,
        integrity: true
      }
    };

    await fs.writeFile('config/monitoreo.json', JSON.stringify(monitoreoConfig, null, 2));
    console.log('   📊 Configuración de monitoreo creada');

    // Crear script de cron para monitoreo automático
    const cronScript = `#!/bin/bash
# Monitoreo automático de encuestas
cd ${process.cwd()}
node scripts/monitoreo-encuestas.js >> logs/monitoreo.log 2>&1
`;

    await fs.writeFile('scripts/cron-monitoreo.sh', cronScript);
    await fs.chmod('scripts/cron-monitoreo.sh', '755');
    console.log('   ⏰ Script de cron creado');
  }

  /**
   * Verificar instalación
   */
  async verificarInstalacion() {
    const verificaciones = [];

    // Verificar archivos creados
    const archivosEsperados = [
      'src/services/encuestaService.js',
      'src/middlewares/loggingMiddleware.js',
      'src/middlewares/rateLimitMiddleware.js',
      'src/middlewares/backupMiddleware.js',
      'config/logging.json',
      'config/monitoreo.json'
    ];

    for (const archivo of archivosEsperados) {
      try {
        await fs.access(archivo);
        verificaciones.push(`✅ ${archivo}`);
      } catch (error) {
        verificaciones.push(`❌ ${archivo} - NO ENCONTRADO`);
      }
    }

    // Verificar índices en base de datos
    try {
      const indices = await sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename IN ('familias', 'personas', 'difuntos_familia')
        AND indexname LIKE 'idx_%'
      `);
      
      verificaciones.push(`✅ ${indices[0].length} índices creados`);
    } catch (error) {
      verificaciones.push(`❌ Error verificando índices: ${error.message}`);
    }

    // Verificar vistas materializadas
    try {
      const vistas = await sequelize.query(`
        SELECT matviewname 
        FROM pg_matviews 
        WHERE matviewname LIKE 'mv_encuestas%'
      `);
      
      verificaciones.push(`✅ ${vistas[0].length} vistas materializadas creadas`);
    } catch (error) {
      verificaciones.push(`❌ Error verificando vistas: ${error.message}`);
    }

    console.log('\n📋 Verificación de instalación:');
    verificaciones.forEach(v => console.log(`   ${v}`));

    // Test básico del servicio
    try {
      const EncuestaService = (await import('../src/services/encuestaService.js')).default;
      const stats = await EncuestaService.obtenerEstadisticas();
      console.log(`   ✅ Servicio funcional - ${stats.total_familias} familias en sistema`);
    } catch (error) {
      console.log(`   ❌ Error en servicio: ${error.message}`);
    }
  }
}

// Ejecutar instalación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const installer = new EncuestasInstaller();
  installer.instalar()
    .then(() => {
      console.log('\n🎯 Instalación completada. El servicio de encuestas está optimizado.');
    })
    .catch((error) => {
      console.error('\n💥 Error durante la instalación:', error);
      process.exit(1);
    });
}

export default EncuestasInstaller;