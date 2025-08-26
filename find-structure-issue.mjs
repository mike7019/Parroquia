// Script para encontrar el problema de estructura en swagger.js
import fs from 'fs';

const content = fs.readFileSync('./src/config/swagger.js', 'utf8');
const lines = content.split('\n');

console.log('🔍 Buscando la estructura del archivo swagger.js...\n');

// Buscar donde se define swaggerConfig
const swaggerConfigLine = lines.findIndex(line => line.includes('const swaggerConfig'));
console.log(`swaggerConfig definido en línea: ${swaggerConfigLine + 1}`);

// Buscar donde aparece components
const componentsLine = lines.findIndex((line, index) => 
  index > swaggerConfigLine && line.trim() === 'components: {'
);
console.log(`components: { encontrado en línea: ${componentsLine + 1}`);

// Buscar donde aparece schemas
const schemasLine = lines.findIndex((line, index) => 
  index > componentsLine && line.trim() === 'schemas: {'
);
console.log(`schemas: { encontrado en línea: ${schemasLine + 1}`);

// Buscar donde aparecen los comentarios de encuestas
const encuestaCommentLine = lines.findIndex(line => 
  line.includes('SCHEMAS DE ENCUESTAS')
);
console.log(`Comentario "SCHEMAS DE ENCUESTAS" en línea: ${encuestaCommentLine + 1}`);

// Buscar donde aparece EncuestaCompleta
const encuestaCompletaLine = lines.findIndex(line => 
  line.includes('EncuestaCompleta: {')
);
console.log(`EncuestaCompleta definido en línea: ${encuestaCompletaLine + 1}`);

// Ahora vamos a verificar si hay un cierre de } antes de EncuestaCompleta
let braceCount = 0;
let foundSchemasClose = false;
let schemasCloseeLine = -1;

for (let i = schemasLine + 1; i < encuestaCompletaLine; i++) {
  const line = lines[i].trim();
  
  // Contar llaves de apertura
  braceCount += (line.match(/{/g) || []).length;
  // Contar llaves de cierre
  braceCount -= (line.match(/}/g) || []).length;
  
  // Si encontramos }, el brace count se vuelve -1, significa que schemas se cerró
  if (braceCount < 0 && !foundSchemasClose) {
    foundSchemasClose = true;
    schemasCloseeLine = i + 1;
    break;
  }
}

if (foundSchemasClose) {
  console.log(`\n❌ PROBLEMA ENCONTRADO:`);
  console.log(`   La sección schemas: { se cierra en la línea ${schemasCloseeLine}`);
  console.log(`   Pero EncuestaCompleta está definido en la línea ${encuestaCompletaLine + 1}`);
  console.log(`   Los schemas de encuesta están FUERA de la estructura schemas!`);
  
  console.log(`\n📋 Contenido alrededor del cierre de schemas (líneas ${schemasCloseeLine - 2} a ${schemasCloseeLine + 2}):`);
  for (let i = schemasCloseeLine - 3; i < schemasCloseeLine + 3; i++) {
    if (i >= 0 && i < lines.length) {
      console.log(`   ${i + 1}: ${lines[i]}`);
    }
  }
  
} else {
  console.log(`\n✅ La sección schemas parece estar abierta hasta EncuestaCompleta`);
}

// Verificar si swaggerConfig se cierra correctamente
console.log('\n🔍 Buscando cierre de swaggerConfig...');
const swaggerConfigClose = lines.findIndex((line, index) => 
  index > swaggerConfigLine && line.trim() === '};' && 
  lines[index + 1] && lines[index + 1].includes('const specs')
);

if (swaggerConfigClose > 0) {
  console.log(`swaggerConfig se cierra en línea: ${swaggerConfigClose + 1}`);
  
  if (encuestaCompletaLine > swaggerConfigClose) {
    console.log(`\n❌ PROBLEMA GRAVE:`);
    console.log(`   swaggerConfig se cierra en línea ${swaggerConfigClose + 1}`);
    console.log(`   Pero EncuestaCompleta está en línea ${encuestaCompletaLine + 1}`);
    console.log(`   Los schemas de encuesta están FUERA de swaggerConfig!`);
  }
}
