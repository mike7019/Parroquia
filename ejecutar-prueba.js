// Script ejecutar la prueba final de parroquia
import { exec } from 'child_process';

exec('cd "d:\\proyecto parroquia" && node test-parroquia-simple.js', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});
