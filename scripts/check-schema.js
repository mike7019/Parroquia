import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost', dialect: 'postgres', logging: false
});

await seq.authenticate();

const tables = [
  'familias',
  'familia_disposicion_basura',
  'familia_sistema_acueducto',
  'familia_sistema_aguas_residuales',
  'familia_tipo_vivienda',
  'tipos_disposicion_basura',
  'sistemas_acueducto',
  'tipos_aguas_residuales',
  'personas'
];

for (const t of tables) {
  const cols = await seq.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`,
    { type: QueryTypes.SELECT }
  );
  if (cols.length > 0) {
    console.log(`\n=== ${t} ===`);
    cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  }
}

await seq.close();
