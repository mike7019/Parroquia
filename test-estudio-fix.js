// Test script to verify the estudio creation fix
// This script shows the correct format for creating a new estudio

const correctEstudioData = {
  "nivel": "Educación Primaria",
  "descripcion": "Nivel básico de educación formal", 
  "ordenNivel": 1,
  "activo": true
};

const incorrectEstudioData = {
  "nombre": "Educación Primaria", // This field name is WRONG - should be "nivel"
  "descripcion": "Nivel básico de educación formal",
  "ordenNivel": 1,
  "activo": true
};

console.log("✅ CORRECT format for creating estudio:");
console.log(JSON.stringify(correctEstudioData, null, 2));

console.log("\n❌ INCORRECT format (this would cause the error you saw):");
console.log(JSON.stringify(incorrectEstudioData, null, 2));

console.log("\n📝 Summary of the fix:");
console.log("- Changed controller validation from 'nombre' to 'nivel'");
console.log("- Updated service to use 'nivel' field consistently");
console.log("- Fixed error message to reflect correct field name");
console.log("- The model already expected 'nivel' field - the issue was in controller/service");
