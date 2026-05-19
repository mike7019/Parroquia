import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const seq = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'postgres', logging: false }
);

const cols = await seq.query(
  `SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'personas' 
   ORDER BY ordinal_position`,
  { type: Sequelize.QueryTypes.SELECT }
);
console.log('Columnas de personas:');
cols.forEach(c => console.log(' -', c.column_name));
await seq.close();
