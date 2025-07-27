import sequelize from './config/sequelize.js';

async function testSurveyQuery() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, user_id, sector, family_head, status, created_at, updated_at
      FROM surveys 
      WHERE user_id = 31
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('Surveys found:');
    results.forEach(survey => {
      console.log(`- ID: ${survey.id}`);
      console.log(`  Sector: ${survey.sector}`);
      console.log(`  Family Head: ${survey.family_head}`);
      console.log(`  Status: ${survey.status}`);
      console.log(`  Created: ${survey.created_at}`);
      console.log('');
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSurveyQuery();
