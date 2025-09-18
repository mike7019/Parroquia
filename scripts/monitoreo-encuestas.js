#!/usr/bin/env node

/**
 * Script de monitoreo para el servicio de encuestas
 * Ejecutar con: node scripts/monitoreo-encuestas.js
 */

import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { logger } from '../src/middlewares/loggingMiddleware.js';
import nodemailer from 'nodemailer';

class EncuestasMonitor {
  constructor() {
    this.alertas = [];
    this.metricas = {};
    this.umbrales = {
      consultas_lentas: 2000, // ms
      uso_memoria: 80, // %
      conexiones_db: 80, // % del máximo
      errores_por_minuto: 10,
      encuestas_por_hora: 100 // máximo esperado
    };
  }

  /**
   * Ejecutar monitoreo completo
   */
  async ejecutarMonitoreo() {
    try {
      logger.info('Iniciando monitoreo de encuestas');

      await this.verificarSaludBaseDatos();
      await this.verificarRendimientoConsultas();
      await this.verificarIntegridadDatos();
      await this.verificarEspacioDisco();
      await this.verificarMetricasNegocio();
      await this.verificarIndices();

      await this.generarReporte();
      
      if (this.alertas.length > 0) {
        await this.enviarAlertas();
      }

      logger.info('Monitoreo completado', {
        alertas_generadas: this.alertas.length,
        metricas: this.metricas
      });

    } catch (error) {
      logger.error('Error en monitoreo', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Verificar salud de la base de datos
   */
  async verificarSaludBaseDatos() {
    try {
      const inicio = Date.now();
      
      // Test de conectividad
      await sequelize.authenticate();
      const tiempoConexion = Date.now() - inicio;
      
      this.metricas.tiempo_conexion_db = tiempoConexion;

      if (tiempoConexion > 1000) {
        this.alertas.push({
          tipo: 'WARNING',
          mensaje: `Conexión a BD lenta: ${tiempoConexion}ms`,
          metrica: 'tiempo_conexion_db',
          valor: tiempoConexion,
          umbral: 1000
        });
      }

      // Verificar conexiones activas
      const [{ conexiones_activas }] = await sequelize.query(`
        SELECT count(*) as conexiones_activas 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `, { type: QueryTypes.SELECT });

      this.metricas.conexiones_activas = parseInt(conexiones_activas);

      // Verificar locks
      const [{ locks_activos }] = await sequelize.query(`
        SELECT count(*) as locks_activos 
        FROM pg_locks 
        WHERE NOT granted
      `, { type: QueryTypes.SELECT });

      this.metricas.locks_activos = parseInt(locks_activos);

      if (locks_activos > 5) {
        this.alertas.push({
          tipo: 'CRITICAL',
          mensaje: `Demasiados locks activos: ${locks_activos}`,
          metrica: 'locks_activos',
          valor: locks_activos,
          umbral: 5
        });
      }

    } catch (error) {
      this.alertas.push({
        tipo: 'CRITICAL',
        mensaje: `Error conectando a BD: ${error.message}`,
        metrica: 'conexion_db',
        error: error.message
      });
    }
  }

  /**
   * Verificar rendimiento de consultas
   */
  async verificarRendimientoConsultas() {
    try {
      // Consultas lentas en familias
      const consultasLentas = await sequelize.query(`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE query LIKE '%familias%' 
        AND mean_exec_time > :umbral
        ORDER BY mean_exec_time DESC 
        LIMIT 5
      `, {
        replacements: { umbral: this.umbrales.consultas_lentas },
        type: QueryTypes.SELECT
      });

      this.metricas.consultas_lentas = consultasLentas.length;

      if (consultasLentas.length > 0) {
        this.alertas.push({
          tipo: 'WARNING',
          mensaje: `${consultasLentas.length} consultas lentas detectadas`,
          metrica: 'consultas_lentas',
          valor: consultasLentas.length,
          detalles: consultasLentas
        });
      }

      // Verificar uso de índices
      const indicesNoUsados = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('familias', 'personas', 'difuntos_familia')
        AND idx_scan = 0
      `, { type: QueryTypes.SELECT });

      this.metricas.indices_no_usados = indicesNoUsados.length;

      if (indicesNoUsados.length > 0) {
        this.alertas.push({
          tipo: 'INFO',
          mensaje: `${indicesNoUsados.length} índices sin uso detectados`,
          metrica: 'indices_no_usados',
          valor: indicesNoUsados.length,
          detalles: indicesNoUsados
        });
      }

    } catch (error) {
      logger.warn('Error verificando rendimiento de consultas', {
        error: error.message
      });
    }
  }

  /**
   * Verificar integridad de datos
   */
  async verificarIntegridadDatos() {
    try {
      // Verificar familias sin personas
      const [{ familias_sin_personas }] = await sequelize.query(`
        SELECT COUNT(*) as familias_sin_personas
        FROM familias f
        LEFT JOIN personas p ON f.id_familia = p.id_familia_familias 
          AND p.identificacion NOT LIKE 'FALLECIDO%'
        WHERE p.id_personas IS NULL
      `, { type: QueryTypes.SELECT });

      this.metricas.familias_sin_personas = parseInt(familias_sin_personas);

      if (familias_sin_personas > 10) {
        this.alertas.push({
          tipo: 'WARNING',
          mensaje: `${familias_sin_personas} familias sin personas detectadas`,
          metrica: 'familias_sin_personas',
          valor: familias_sin_personas
        });
      }

      // Verificar identificaciones duplicadas
      const identificacionesDuplicadas = await sequelize.query(`
        SELECT identificacion, COUNT(*) as duplicados
        FROM personas 
        WHERE identificacion NOT LIKE 'TEMP_%' 
        AND identificacion NOT LIKE 'FALLECIDO_%'
        GROUP BY identificacion 
        HAVING COUNT(*) > 1
      `, { type: QueryTypes.SELECT });

      this.metricas.identificaciones_duplicadas = identificacionesDuplicadas.length;

      if (identificacionesDuplicadas.length > 0) {
        this.alertas.push({
          tipo: 'CRITICAL',
          mensaje: `${identificacionesDuplicadas.length} identificaciones duplicadas`,
          metrica: 'identificaciones_duplicadas',
          valor: identificacionesDuplicadas.length,
          detalles: identificacionesDuplicadas
        });
      }

      // Verificar referencias huérfanas
      const referenciasHuerfanas = await sequelize.query(`
        SELECT COUNT(*) as huerfanas
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        WHERE f.id_familia IS NULL
      `, { type: QueryTypes.SELECT });

      this.metricas.referencias_huerfanas = parseInt(referenciasHuerfanas[0].huerfanas);

      if (this.metricas.referencias_huerfanas > 0) {
        this.alertas.push({
          tipo: 'CRITICAL',
          mensaje: `${this.metricas.referencias_huerfanas} personas sin familia`,
          metrica: 'referencias_huerfanas',
          valor: this.metricas.referencias_huerfanas
        });
      }

    } catch (error) {
      logger.warn('Error verificando integridad de datos', {
        error: error.message
      });
    }
  }

  /**
   * Verificar espacio en disco
   */
  async verificarEspacioDisco() {
    try {
      const espacioTablas = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('familias', 'personas', 'difuntos_familia')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `, { type: QueryTypes.SELECT });

      this.metricas.espacio_tablas = espacioTablas;

      // Verificar crecimiento de tablas
      const totalBytes = espacioTablas.reduce((sum, tabla) => sum + parseInt(tabla.size_bytes), 0);
      const totalMB = Math.round(totalBytes / 1024 / 1024);

      this.metricas.espacio_total_mb = totalMB;

      if (totalMB > 1000) { // Más de 1GB
        this.alertas.push({
          tipo: 'INFO',
          mensaje: `Tablas de encuestas ocupan ${totalMB}MB`,
          metrica: 'espacio_total_mb',
          valor: totalMB
        });
      }

    } catch (error) {
      logger.warn('Error verificando espacio en disco', {
        error: error.message
      });
    }
  }

  /**
   * Verificar métricas de negocio
   */
  async verificarMetricasNegocio() {
    try {
      // Encuestas creadas en las últimas 24 horas
      const [{ encuestas_24h }] = await sequelize.query(`
        SELECT COUNT(*) as encuestas_24h
        FROM familias 
        WHERE fecha_ultima_encuesta >= NOW() - INTERVAL '24 hours'
      `, { type: QueryTypes.SELECT });

      this.metricas.encuestas_24h = parseInt(encuestas_24h);

      // Promedio de personas por familia
      const [{ promedio_personas }] = await sequelize.query(`
        SELECT AVG(tamaño_familia) as promedio_personas
        FROM familias 
        WHERE tamaño_familia > 0
      `, { type: QueryTypes.SELECT });

      this.metricas.promedio_personas_familia = parseFloat(promedio_personas).toFixed(2);

      // Distribución por municipios
      const distribucionMunicipios = await sequelize.query(`
        SELECT 
          m.nombre_municipio,
          COUNT(f.id_familia) as total_familias
        FROM municipios m
        LEFT JOIN familias f ON m.id_municipio = f.id_municipio
        GROUP BY m.id_municipio, m.nombre_municipio
        ORDER BY total_familias DESC
        LIMIT 5
      `, { type: QueryTypes.SELECT });

      this.metricas.distribucion_municipios = distribucionMunicipios;

    } catch (error) {
      logger.warn('Error verificando métricas de negocio', {
        error: error.message
      });
    }
  }

  /**
   * Verificar estado de índices
   */
  async verificarIndices() {
    try {
      const estadoIndices = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('familias', 'personas', 'difuntos_familia')
        ORDER BY idx_scan DESC
      `, { type: QueryTypes.SELECT });

      this.metricas.estado_indices = estadoIndices;

      // Verificar fragmentación de índices
      const fragmentacionIndices = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('familias', 'personas', 'difuntos_familia')
        ORDER BY pg_relation_size(indexrelid) DESC
      `, { type: QueryTypes.SELECT });

      this.metricas.fragmentacion_indices = fragmentacionIndices;

    } catch (error) {
      logger.warn('Error verificando índices', {
        error: error.message
      });
    }
  }

  /**
   * Generar reporte de monitoreo
   */
  async generarReporte() {
    const reporte = {
      timestamp: new Date().toISOString(),
      resumen: {
        total_alertas: this.alertas.length,
        alertas_criticas: this.alertas.filter(a => a.tipo === 'CRITICAL').length,
        alertas_warning: this.alertas.filter(a => a.tipo === 'WARNING').length,
        alertas_info: this.alertas.filter(a => a.tipo === 'INFO').length
      },
      metricas: this.metricas,
      alertas: this.alertas
    };

    // Guardar reporte en archivo
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const reporteDir = path.join(process.cwd(), 'logs', 'monitoreo');
    await fs.mkdir(reporteDir, { recursive: true });
    
    const fecha = new Date().toISOString().split('T')[0];
    const reporteFile = path.join(reporteDir, `encuestas-monitoreo-${fecha}.json`);
    
    await fs.writeFile(reporteFile, JSON.stringify(reporte, null, 2));

    logger.info('Reporte de monitoreo generado', {
      archivo: reporteFile,
      alertas: reporte.resumen.total_alertas
    });
  }

  /**
   * Enviar alertas por email
   */
  async enviarAlertas() {
    try {
      if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL) {
        logger.warn('Configuración de email no disponible para alertas');
        return;
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const alertasCriticas = this.alertas.filter(a => a.tipo === 'CRITICAL');
      const alertasWarning = this.alertas.filter(a => a.tipo === 'WARNING');

      if (alertasCriticas.length > 0 || alertasWarning.length > 0) {
        const asunto = `🚨 Alertas Sistema Encuestas - ${alertasCriticas.length} críticas, ${alertasWarning.length} warnings`;
        
        const cuerpo = `
          <h2>Reporte de Alertas - Sistema de Encuestas</h2>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Resumen</h3>
          <ul>
            <li>Alertas Críticas: ${alertasCriticas.length}</li>
            <li>Alertas Warning: ${alertasWarning.length}</li>
            <li>Alertas Info: ${this.alertas.filter(a => a.tipo === 'INFO').length}</li>
          </ul>

          ${alertasCriticas.length > 0 ? `
          <h3>🔴 Alertas Críticas</h3>
          <ul>
            ${alertasCriticas.map(a => `<li><strong>${a.metrica}:</strong> ${a.mensaje}</li>`).join('')}
          </ul>
          ` : ''}

          ${alertasWarning.length > 0 ? `
          <h3>🟡 Alertas Warning</h3>
          <ul>
            ${alertasWarning.map(a => `<li><strong>${a.metrica}:</strong> ${a.mensaje}</li>`).join('')}
          </ul>
          ` : ''}

          <h3>Métricas Principales</h3>
          <ul>
            <li>Tiempo conexión DB: ${this.metricas.tiempo_conexion_db}ms</li>
            <li>Conexiones activas: ${this.metricas.conexiones_activas}</li>
            <li>Encuestas 24h: ${this.metricas.encuestas_24h}</li>
            <li>Espacio total: ${this.metricas.espacio_total_mb}MB</li>
          </ul>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'sistema@parroquia.com',
          to: process.env.ALERT_EMAIL,
          subject: asunto,
          html: cuerpo
        });

        logger.info('Alertas enviadas por email', {
          destinatario: process.env.ALERT_EMAIL,
          alertas_enviadas: this.alertas.length
        });
      }

    } catch (error) {
      logger.error('Error enviando alertas por email', {
        error: error.message
      });
    }
  }
}

// Ejecutar monitoreo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new EncuestasMonitor();
  monitor.ejecutarMonitoreo()
    .then(() => {
      console.log('✅ Monitoreo completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en monitoreo:', error);
      process.exit(1);
    });
}

export default EncuestasMonitor;