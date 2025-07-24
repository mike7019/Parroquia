const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Create certificates directory
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// Generate a keypair
console.log('Generating RSA key pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
console.log('Creating self-signed certificate...');
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'countryName',
  value: 'US'
}, {
  name: 'organizationName',
  value: 'Parroquia Dev'
}, {
  name: 'commonName',
  value: 'localhost'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add extensions for localhost and IP
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: false
  },
  {
    name: 'keyUsage',
    keyCertSign: false,
    digitalSignature: true,
    keyEncipherment: true
  },
  {
    name: 'subjectAltName',
    altNames: [
      {
        type: 2, // DNS
        value: 'localhost'
      },
      {
        type: 2, // DNS
        value: '*.localhost'
      },
      {
        type: 7, // IP
        ip: '127.0.0.1'
      },
      {
        type: 7, // IP
        ip: '::1'
      }
    ]
  }
]);

// Self-sign certificate
cert.sign(keys.privateKey);

// Convert to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Save to files
const certPath = path.join(certDir, 'server.crt');
const keyPath = path.join(certDir, 'server.key');

fs.writeFileSync(certPath, certPem);
fs.writeFileSync(keyPath, keyPem);

console.log('SSL certificate created successfully!');
console.log(`Certificate: ${certPath}`);
console.log(`Private Key: ${keyPath}`);
console.log('\nTo trust this certificate in your browser:');
console.log('1. Open the certificate file in your browser');
console.log('2. Click "Advanced" -> "Proceed to localhost (unsafe)"');
console.log('3. Or add it to your trusted certificates');
