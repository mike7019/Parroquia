/**
 * Script para obtener los IDs reales de los catálogos
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';
import chalk from 'chalk';

async function getValidCatalogIds() {
  try {
    console.log(chalk.blue('\n📋 OBTENIENDO IDS VÁLIDOS DE CATÁLOGOS\n'));
    
    // Profesiones
    const profesiones = await sequelize.query(
      'SELECT id_profesion, nombre FROM profesiones ORDER BY id_profesion LIMIT 10',
      { type: QueryTypes.SELECT }
    );
    
    console.log(chalk.yellow('PROFESIONES:'));
    profesiones.forEach(p => console.log(`  ID ${chalk.green(p.id_profesion)}: ${p.nombre}`));
    
    // Destrezas
    const destrezas = await sequelize.query(
      'SELECT id_destreza, nombre FROM destrezas ORDER BY id_destreza LIMIT 10',
      { type: QueryTypes.SELECT }
    );
    
    console.log(chalk.yellow('\nDESTREZAS:'));
    destrezas.forEach(d => console.log(`  ID ${chalk.green(d.id_destreza)}: ${d.nombre}`));
    
    // Habilidades
    const habilidades = await sequelize.query(
      'SELECT id_habilidad, nombre FROM habilidades ORDER BY id_habilidad LIMIT 10',
      { type: QueryTypes.SELECT }
    );
    
    console.log(chalk.yellow('\nHABILIDADES:'));
    habilidades.forEach(h => console.log(`  ID ${chalk.green(h.id_habilidad)}: ${h.nombre}`));
    
    // Generar JSON para usar en tests
    console.log(chalk.blue('\n📝 JSON PARA TESTS:'));
    console.log(chalk.cyan('\nprofesion: { id:'), chalk.green(profesiones[0].id_profesion), chalk.cyan('}  // ' + profesiones[0].nombre));
    console.log(chalk.cyan('destrezas: [{ id:'), chalk.green(destrezas[0].id_destreza), chalk.cyan('}]  // ' + destrezas[0].nombre));
    console.log(chalk.cyan('habilidades: [{ id:'), chalk.green(habilidades[0].id_habilidad), chalk.cyan('}]  // ' + habilidades[0].nombre));
    
  } catch (error) {
    console.error(chalk.red('\n❌ ERROR:'), error.message);
  } finally {
    await sequelize.close();
  }
}

getValidCatalogIds();
