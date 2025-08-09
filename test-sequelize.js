// Test sequelize import
try {
  console.log('Testing Sequelize import...');
  import('sequelize')
    .then(module => {
      console.log('Sequelize loaded successfully:', typeof module.Op);
    })
    .catch(error => {
      console.error('Error loading Sequelize:', error.message);
    });
} catch (error) {
  console.error('Sync error:', error);
}
