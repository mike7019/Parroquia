import sequelize from './config/sequelize.js';

async function checkSurveyColumns() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'surveys'
      ORDER BY ordinal_position
    `);
    
    console.log('Surveys table columns:');
    results.forEach(r => console.log('-', r.column_name));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSurveyColumns();
