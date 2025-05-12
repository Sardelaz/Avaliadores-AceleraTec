const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const templatePath = './firebase-config.template.js';
const outputPath = './docs/js/firebase-config.js';

let content = fs.readFileSync(templatePath, 'utf8');

const keys = [
  'APIKEY',
  'AUTHDOMAIN',
  'PROJECTID',
  'STORAGEBUCKET',
  'MESSAGINGSENDERID',
  'APPID',
  'MEASUREMENTID',
];

keys.forEach(key => {
  const value = process.env[key];
  const pattern = new RegExp(`%%${key}%%`, 'g');
  content = content.replace(pattern, value);
});

fs.writeFileSync(outputPath, content);

console.log('✅ firebase-config.js gerado com sucesso em /js');
