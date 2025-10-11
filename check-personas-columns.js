import {Sequelize, QueryTypes} from 'sequelize';

const sequelize = new Sequelize('parroquia_db', 'parroquia_user', 'parroquia_password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkColumns() {
  const columns = await sequelize.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'personas' 
    ORDER BY ordinal_position
    LIMIT 10
  `, {type: QueryTypes.SELECT});
  
  console.log('Primeras 10 columnas de tabla personas:');
  columns.forEach(c => console.log('  -', c.column_name));
  
  process.exit(0);
}

checkColumns();
