import markdownPdf from 'markdown-pdf';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'DOCKER_DEPLOYMENT_GUIDE.md');
const outputFile = path.join(__dirname, 'DOCKER_DEPLOYMENT_GUIDE.pdf');

console.log('🚀 Generando PDF...');
console.log(`📄 Entrada: ${inputFile}`);
console.log(`📤 Salida: ${outputFile}`);

markdownPdf()
  .from(inputFile)
  .to(outputFile, (err) => {
    if (err) {
      console.error('❌ Error al generar PDF:', err);
      process.exit(1);
    }
    console.log('✅ PDF generado exitosamente!');
    console.log(`   📁 Archivo: ${outputFile}`);
  });
