/**
 * Servicio de Estadísticas Generales del Sistema
 * Proporciona métricas y estadísticas de TODAS las entidades del sistema
 */

import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';

// Importar modelos de catálogo
import Departamentos from '../models/catalog/Departamentos.js';
import Municipios from '../models/catalog/Municipios.js';
import Parroquia from '../models/catalog/Parroquia.js';
import Sector from '../models/catalog/Sector.js';
import Veredas from '../models/catalog/Veredas.js';

import Familias from '../models/catalog/Familias.js';
import Persona from '../models/catalog/Persona.js';
import DifuntosFamilia from '../models/catalog/DifuntosFamilia.js';

import Profesion from '../models/catalog/Profesion.js';
import Habilidad from '../models/catalog/Habilidad.js';
import Estudio from '../models/catalog/Estudio.js';
import Enfermedad from '../models/catalog/Enfermedad.js';
import ComunidadCultural from '../models/catalog/ComunidadCultural.js';
import Parentesco from '../models/catalog/Parentesco.js';

import Sexo from '../models/catalog/Sexo.js';
import SituacionCivil from '../models/catalog/SituacionCivil.js';
import Talla from '../models/catalog/Talla.js';
import TipoIdentificacion from '../models/catalog/TipoIdentificacion.js';
import TipoVivienda from '../models/catalog/TipoVivienda.js';
import SistemaAcueducto from '../models/catalog/SistemaAcueducto.js';
import TipoAguasResiduales from '../models/catalog/TipoAguasResiduales.js';
import TipoDisposicionBasura from '../models/catalog/TipoDisposicionBasura.js';

// Importar modelos de usuarios
import Usuario from '../models/Usuario.js';
import Role from '../models/Role.js';

class EstadisticasGeneralesService {
  
  /**
   * Obtener estadísticas completas del sistema
   */
  async getEstadisticasCompletas() {
    try {
      const estadisticas = {
        timestamp: new Date(),
        resumen: await this.getResumenGeneral(),
        geografia: await this.getEstadisticasGeografia(),
        poblacion: await this.getEstadisticasPoblacion(),
        familias: await this.getEstadisticasFamilias(),
        salud: await this.getEstadisticasSalud(),
        educacion: await this.getEstadisticasEducacion(),
        vivienda: await this.getEstadisticasVivienda(),
        catalogos: await this.getEstadisticasCatalogos(),
        usuarios: await this.getEstadisticasUsuarios(),
      };

      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas completas:', error);
      throw error;
    }
  }

  /**
   * Resumen general del sistema
   */
  async getResumenGeneral() {
    try {
      const [totalPersonas] = await sequelize.query(
        'SELECT COUNT(*) as total FROM personas',
        { type: QueryTypes.SELECT }
      );

      const [totalFamilias] = await sequelize.query(
        'SELECT COUNT(*) as total FROM familias',
        { type: QueryTypes.SELECT }
      );

      const [totalDifuntos] = await sequelize.query(
        'SELECT COUNT(*) as total FROM difuntos_familia',
        { type: QueryTypes.SELECT }
      );

      const [totalUsuarios] = await sequelize.query(
        'SELECT COUNT(*) as total FROM usuarios',
        { type: QueryTypes.SELECT }
      );

      const [totalDepartamentos] = await sequelize.query(
        'SELECT COUNT(*) as total FROM departamentos',
        { type: QueryTypes.SELECT }
      );

      const [totalMunicipios] = await sequelize.query(
        'SELECT COUNT(*) as total FROM municipios',
        { type: QueryTypes.SELECT }
      );

      return {
        totalPersonas: parseInt(totalPersonas.total),
        totalPersonasVivas: parseInt(totalPersonas.total) - parseInt(totalDifuntos.total),
        totalDifuntos: parseInt(totalDifuntos.total),
        totalFamilias: parseInt(totalFamilias.total),
        totalUsuarios: parseInt(totalUsuarios.total),
        totalDepartamentos: parseInt(totalDepartamentos.total),
        totalMunicipios: parseInt(totalMunicipios.total),
      };
    } catch (error) {
      console.error('Error al obtener resumen general:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de geografía
   */
  async getEstadisticasGeografia() {
    try {
      const totalDepartamentos = await Departamentos.count();
      const totalMunicipios = await Municipios.count();
      const totalParroquias = await Parroquia.count();
      const totalSectores = await Sector.count();
      const totalVeredas = await Veredas.count();

      // Distribución por departamento
      const [distribucionDepartamentos] = await sequelize.query(`
        SELECT 
          d.nombre as departamento,
          COUNT(DISTINCT m.id_municipio) as municipios,
          COUNT(DISTINCT p.id_parroquia) as parroquias,
          COUNT(DISTINCT f.id_familia) as familias
        FROM departamentos d
        LEFT JOIN municipios m ON d.id_departamento = m.id_departamento
        LEFT JOIN parroquia p ON m.id_municipio = p.id_municipio
        LEFT JOIN familias f ON p.id_parroquia = f.id_parroquia
        GROUP BY d.id_departamento, d.nombre
        ORDER BY familias DESC
      `, { type: QueryTypes.SELECT });

      return {
        total: {
          departamentos: totalDepartamentos,
          municipios: totalMunicipios,
          parroquias: totalParroquias,
          sectores: totalSectores,
          veredas: totalVeredas,
        },
        distribucion: distribucionDepartamentos,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de geografía:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de población
   */
  async getEstadisticasPoblacion() {
    try {
      // Total de personas
      const totalPersonas = await Persona.count();

      // Distribución por sexo
      const [distribucionSexo] = await sequelize.query(`
        SELECT 
          s.nombre as sexo,
          COUNT(p.id_personas) as total,
          ROUND(COUNT(p.id_personas) * 100.0 / SUM(COUNT(p.id_personas)) OVER(), 2) as porcentaje
        FROM personas p
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        GROUP BY s.id_sexo, s.nombre
        ORDER BY total DESC
      `, { type: QueryTypes.SELECT });

      // Distribución por estado civil
      const [distribucionEstadoCivil] = await sequelize.query(`
        SELECT 
          sc.nombre as estado_civil,
          COUNT(p.id_personas) as total,
          ROUND(COUNT(p.id_personas) * 100.0 / SUM(COUNT(p.id_personas)) OVER(), 2) as porcentaje
        FROM personas p
        LEFT JOIN situaciones_civiles sc ON p.id_estado_civil_estado_civil = sc.id_situacion_civil
        GROUP BY sc.id_situacion_civil, sc.nombre
        ORDER BY total DESC
      `, { type: QueryTypes.SELECT });

      // Rangos de edad
      const [distribucionEdad] = await sequelize.query(`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) < 5 THEN '0-4 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 5 AND 11 THEN '5-11 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 12 AND 17 THEN '12-17 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 18 AND 25 THEN '18-25 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 26 AND 35 THEN '26-35 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 36 AND 50 THEN '36-50 años'
            WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN 51 AND 65 THEN '51-65 años'
            ELSE '65+ años'
          END as rango_edad,
          COUNT(*) as total
        FROM personas
        WHERE fecha_nacimiento IS NOT NULL
        GROUP BY rango_edad
        ORDER BY MIN(EXTRACT(YEAR FROM AGE(fecha_nacimiento)))
      `, { type: QueryTypes.SELECT });

      // Distribución por tipo de identificación
      const [distribucionTipoId] = await sequelize.query(`
        SELECT 
          ti.nombre as tipo_identificacion,
          COUNT(p.id_personas) as total
        FROM personas p
        LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        GROUP BY ti.id_tipo_identificacion, ti.nombre
        ORDER BY total DESC
      `, { type: QueryTypes.SELECT });

      return {
        total: totalPersonas,
        distribucionSexo,
        distribucionEstadoCivil,
        distribucionEdad,
        distribucionTipoIdentificacion: distribucionTipoId,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de población:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de familias
   */
  async getEstadisticasFamilias() {
    try {
      const totalFamilias = await Familias.count();

      // Promedio de miembros por familia
      const [promedioMiembros] = await sequelize.query(`
        SELECT 
          ROUND(AVG(miembros), 2) as promedio,
          MAX(miembros) as maximo,
          MIN(miembros) as minimo
        FROM (
          SELECT id_familia_familias, COUNT(*) as miembros
          FROM personas
          WHERE id_familia_familias IS NOT NULL
          GROUP BY id_familia_familias
        ) as familias_miembros
      `, { type: QueryTypes.SELECT });

      // Distribución por parroquia
      const [distribucionParroquia] = await sequelize.query(`
        SELECT 
          p.nombre as parroquia,
          COUNT(f.id_familia) as total_familias,
          COUNT(DISTINCT per.id_personas) as total_personas
        FROM familias f
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN personas per ON f.id_familia = per.id_familia_familias
        GROUP BY p.id_parroquia, p.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Familias con difuntos
      const [familiasConDifuntos] = await sequelize.query(`
        SELECT COUNT(DISTINCT id_familia_familias) as total
        FROM difuntos_familia
      `, { type: QueryTypes.SELECT });

      return {
        total: totalFamilias,
        promedioMiembrosPorFamilia: parseFloat(promedioMiembros?.promedio || 0),
        maxMiembrosPorFamilia: parseInt(promedioMiembros?.maximo || 0),
        minMiembrosPorFamilia: parseInt(promedioMiembros?.minimo || 0),
        familiasConDifuntos: parseInt(familiasConDifuntos?.total || 0),
        distribucionPorParroquia: distribucionParroquia,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de familias:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de salud
   */
  async getEstadisticasSalud() {
    try {
      // Simplificado: solo retornar conteos básicos
      const result = await sequelize.query(`
        SELECT 
          COUNT(*) as total_personas,
          COUNT(CASE WHEN necesidad_enfermo IS NOT NULL AND necesidad_enfermo != '' THEN 1 END) as con_enfermedades
        FROM personas
      `, { type: QueryTypes.SELECT });
      
      return {
        totalPersonas: parseInt(result[0].total_personas),
        personasConEnfermedades: parseInt(result[0].con_enfermedades),
        mensaje: 'Endpoint de salud simplificado - en desarrollo'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de salud:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de educación
   */
  async getEstadisticasEducacion() {
    try {
      // Simplificado: conteos básicos sin usar Sequelize count()
      const [totales] = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM profesiones) as total_profesiones,
          (SELECT COUNT(*) FROM habilidades) as total_habilidades,
          (SELECT COUNT(DISTINCT id_profesion) FROM personas WHERE id_profesion IS NOT NULL) as personas_con_profesion
        FROM (SELECT 1) as dummy
      `, { type: QueryTypes.SELECT });

      return {
        totalProfesionesCatalogo: parseInt(totales.total_profesiones),
        totalHabilidadesCatalogo: parseInt(totales.total_habilidades),
        personasConProfesion: parseInt(totales.personas_con_profesion),
        mensaje: 'Endpoint de educación simplificado - en desarrollo'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de educación:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de vivienda
   */
  async getEstadisticasVivienda() {
    try {
      // Totales generales
      const [totales] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_familias,
          COUNT(id_tipo_vivienda) as con_tipo_vivienda
        FROM familias
      `, { type: QueryTypes.SELECT });

      // Distribución por tipo de vivienda
      const distribucionTipoVivienda = await sequelize.query(`
        SELECT 
          tv.nombre as tipo_vivienda,
          tv.descripcion,
          COUNT(f.id_familia) as total_familias,
          ROUND(COUNT(f.id_familia) * 100.0 / NULLIF((SELECT COUNT(*) FROM familias WHERE id_tipo_vivienda IS NOT NULL), 0), 2) as porcentaje
        FROM tipos_vivienda tv
        LEFT JOIN familias f ON tv.id_tipo_vivienda = f.id_tipo_vivienda
        WHERE tv.activo = true
        GROUP BY tv.id_tipo_vivienda, tv.nombre, tv.descripcion
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Distribución por sistema de acueducto
      const distribucionAcueducto = await sequelize.query(`
        SELECT 
          sa.descripcion as sistema_acueducto,
          COUNT(DISTINCT fsa.id_familia) as total_familias,
          ROUND(COUNT(DISTINCT fsa.id_familia) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_familia) FROM familia_sistema_acueductos), 0), 2) as porcentaje
        FROM sistemas_acueductos sa
        LEFT JOIN familia_sistema_acueductos fsa ON sa.id_sistema = fsa.id_sistema_acueducto
        WHERE sa.activo = true
        GROUP BY sa.id_sistema, sa.descripcion
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Distribución por disposición de basura (usando el campo 'disposicion' en la tabla relacional)
      const distribucionBasura = await sequelize.query(`
        SELECT 
          fdb.disposicion as tipo_disposicion,
          COUNT(DISTINCT fdb.id_familia) as total_familias,
          ROUND(COUNT(DISTINCT fdb.id_familia) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_familia) FROM familia_disposicion_basuras), 0), 2) as porcentaje
        FROM familia_disposicion_basuras fdb
        WHERE fdb.disposicion IS NOT NULL AND fdb.disposicion != ''
        GROUP BY fdb.disposicion
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Distribución por aguas residuales
      const distribucionAguasResiduales = await sequelize.query(`
        SELECT 
          tar.nombre as tipo_aguas_residuales,
          tar.descripcion,
          COUNT(DISTINCT far.id_familia) as total_familias,
          ROUND(COUNT(DISTINCT far.id_familia) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_familia) FROM familia_sistema_aguas_residuales), 0), 2) as porcentaje
        FROM tipos_aguas_residuales tar
        LEFT JOIN familia_sistema_aguas_residuales far ON tar.id_tipo_aguas_residuales = far.id_tipo_aguas_residuales
        GROUP BY tar.id_tipo_aguas_residuales, tar.nombre, tar.descripcion
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      return {
        // Totales
        totalFamilias: parseInt(totales.total_familias),
        familiasConTipoVivienda: parseInt(totales.con_tipo_vivienda),
        
        // Distribuciones detalladas
        distribucionPorTipoVivienda: distribucionTipoVivienda,
        distribucionPorAcueducto: distribucionAcueducto,
        distribucionPorDisposicionBasura: distribucionBasura,
        distribucionPorAguasResiduales: distribucionAguasResiduales,
        
        // Resumen por categoría
        resumenCategorias: {
          tiposVivienda: distribucionTipoVivienda.filter(v => parseInt(v.total_familias) > 0).length,
          sistemasAcueducto: distribucionAcueducto.filter(a => parseInt(a.total_familias) > 0).length,
          tiposDisposicionBasura: distribucionBasura.filter(d => parseInt(d.total_familias) > 0).length,
          tiposAguasResiduales: distribucionAguasResiduales.filter(a => parseInt(a.total_familias) > 0).length
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de vivienda:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de catálogos del sistema
   */
  async getEstadisticasCatalogos() {
    try {
      // Usar SQL directo para evitar problemas con Sequelize count()
      const [catalogos] = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM sexos) as total_sexos,
          (SELECT COUNT(*) FROM situaciones_civiles) as total_situaciones_civiles,
          (SELECT COUNT(*) FROM profesiones) as total_profesiones,
          (SELECT COUNT(*) FROM habilidades) as total_habilidades,
          (SELECT COUNT(*) FROM enfermedades) as total_enfermedades,
          (SELECT COUNT(*) FROM parentescos) as total_parentescos
        FROM (SELECT 1) as dummy
      `, { type: QueryTypes.SELECT });

      return {
        sexos: parseInt(catalogos.total_sexos),
        situacionesCiviles: parseInt(catalogos.total_situaciones_civiles),
        profesiones: parseInt(catalogos.total_profesiones),
        habilidades: parseInt(catalogos.total_habilidades),
        enfermedades: parseInt(catalogos.total_enfermedades),
        parentescos: parseInt(catalogos.total_parentescos)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de catálogos:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de usuarios del sistema
   */
  async getEstadisticasUsuarios() {
    try {
      // Estadísticas básicas de usuarios
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_usuarios,
          COUNT(CASE WHEN activo = true THEN 1 END) as usuarios_activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as usuarios_inactivos,
          COUNT(CASE WHEN email_verificado = true THEN 1 END) as emails_verificados,
          COUNT(CASE WHEN bloqueado_hasta IS NOT NULL AND bloqueado_hasta > NOW() THEN 1 END) as usuarios_bloqueados
        FROM usuarios
      `, { type: QueryTypes.SELECT });

      // Total de roles en el sistema
      const [rolesCount] = await sequelize.query(`
        SELECT COUNT(*) as total_roles FROM roles
      `, { type: QueryTypes.SELECT });

      // Distribución de usuarios por rol
      const distribucionPorRol = await sequelize.query(`
        SELECT 
          r.nombre as rol,
          COUNT(DISTINCT ur.id_usuarios) as total_usuarios,
          COUNT(DISTINCT CASE WHEN u.activo = true THEN u.id END) as usuarios_activos,
          COUNT(DISTINCT CASE WHEN u.activo = false THEN u.id END) as usuarios_inactivos,
          ROUND(COUNT(DISTINCT ur.id_usuarios) * 100.0 / NULLIF((SELECT COUNT(DISTINCT id_usuarios) FROM usuarios_roles), 0), 2) as porcentaje
        FROM roles r
        LEFT JOIN usuarios_roles ur ON r.id = ur.id_roles
        LEFT JOIN usuarios u ON ur.id_usuarios = u.id
        GROUP BY r.id, r.nombre
        HAVING COUNT(DISTINCT ur.id_usuarios) > 0
        ORDER BY total_usuarios DESC, r.nombre
      `, { type: QueryTypes.SELECT });

      // Roles sin usuarios asignados
      const rolesSinUsuarios = await sequelize.query(`
        SELECT 
          r.nombre as rol
        FROM roles r
        LEFT JOIN usuarios_roles ur ON r.id = ur.id_roles
        GROUP BY r.id, r.nombre
        HAVING COUNT(ur.id_usuarios) = 0
        ORDER BY r.nombre
      `, { type: QueryTypes.SELECT });

      // Usuarios con múltiples roles
      const [usuariosMultiRol] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT id_usuarios) as usuarios_multi_rol
        FROM (
          SELECT id_usuarios, COUNT(*) as num_roles
          FROM usuarios_roles
          GROUP BY id_usuarios
          HAVING COUNT(*) > 1
        ) as multi
      `, { type: QueryTypes.SELECT });

      // Top 5 roles más usados
      const top5Roles = distribucionPorRol.slice(0, 5);

      return {
        // Totales generales
        totalUsuarios: parseInt(stats.total_usuarios),
        usuariosActivos: parseInt(stats.usuarios_activos),
        usuariosInactivos: parseInt(stats.usuarios_inactivos),
        emailsVerificados: parseInt(stats.emails_verificados),
        usuariosBloqueados: parseInt(stats.usuarios_bloqueados),
        totalRoles: parseInt(rolesCount.total_roles),
        
        // Distribución detallada por rol
        distribucionPorRol: distribucionPorRol.map(item => ({
          rol: item.rol,
          totalUsuarios: parseInt(item.total_usuarios),
          usuariosActivos: parseInt(item.usuarios_activos),
          usuariosInactivos: parseInt(item.usuarios_inactivos),
          porcentaje: parseFloat(item.porcentaje) || 0
        })),

        // Estadísticas de roles
        rolesEnUso: distribucionPorRol.length,
        rolesSinAsignar: rolesSinUsuarios.length,
        usuariosConMultiplesRoles: parseInt(usuariosMultiRol.usuarios_multi_rol),

        // Top 5 roles más populares
        top5RolesMasUsados: top5Roles.map(item => ({
          rol: item.rol,
          usuarios: parseInt(item.total_usuarios),
          porcentaje: parseFloat(item.porcentaje) || 0
        })),

        // Lista de roles sin usuarios (útil para limpieza)
        rolesSinUsuarios: rolesSinUsuarios.map(item => item.rol)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas específicas por categoría
   */
  async getEstadisticasPorCategoria(categoria) {
    const categorias = {
      geografia: () => this.getEstadisticasGeografia(),
      poblacion: () => this.getEstadisticasPoblacion(),
      familias: () => this.getEstadisticasFamilias(),
      salud: () => this.getEstadisticasSalud(),
      educacion: () => this.getEstadisticasEducacion(),
      vivienda: () => this.getEstadisticasVivienda(),
      catalogos: () => this.getEstadisticasCatalogos(),
      usuarios: () => this.getEstadisticasUsuarios(),
      resumen: () => this.getResumenGeneral(),
    };

    if (!categorias[categoria]) {
      throw new Error(`Categoría de estadísticas no válida: ${categoria}`);
    }

    return categorias[categoria]();
  }
}

export default new EstadisticasGeneralesService();
