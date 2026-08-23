import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Helpers compartidos por los seeders de catálogos.
 * Extraído de configSeeder.js para que catalogosAdicionalesSeeder.js
 * (y cualquier seeder futuro) no dupliquen esta lógica.
 */

/** Verifica si una tabla ya tiene datos, para no duplicar en reseeds. */
export async function tableHasData(tableName) {
  try {
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName}`,
      { type: QueryTypes.SELECT }
    );
    return results.count > 0;
  } catch (error) {
    console.warn(`⚠️  Tabla ${tableName} no existe o no se puede consultar:`, error.message);
    return false;
  }
}

/**
 * Inserta datos en una tabla solo si está vacía (idempotente).
 * Si el bulkInsert normal falla (ej. por columnas autoincrementales),
 * reintenta con una query manual excluyendo campos "id_*".
 */
export async function safeInsert(tableName, data, description) {
  try {
    const hasData = await tableHasData(tableName);

    if (hasData) {
      console.log(`ℹ️  ${description}: datos ya existen, saltando inserción`);
      return false;
    }

    try {
      await sequelize.getQueryInterface().bulkInsert(tableName, data);
      console.log(`✅ ${description}: ${data.length} registros insertados`);
      return true;
    } catch (insertError) {
      console.warn(`⚠️  Inserción normal falló para ${tableName}, intentando query directa...`);

      const fields = Object.keys(data[0]).filter(key => !key.includes('id_'));
      const fieldNames = fields.join(', ');
      const values = data.map(item => {
        const itemValues = fields.map(field => {
          const value = item[field];
          if (value instanceof Date) {
            return `'${value.toISOString()}'`;
          } else if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          } else if (value === null || value === undefined) {
            return 'NULL';
          } else {
            return value;
          }
        });
        return `(${itemValues.join(', ')})`;
      }).join(', ');

      const query = `INSERT INTO ${tableName} (${fieldNames}) VALUES ${values}`;
      await sequelize.query(query);
      console.log(`✅ ${description}: ${data.length} registros insertados (query directa)`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error insertando ${description}:`, error.message);
    return false;
  }
}
