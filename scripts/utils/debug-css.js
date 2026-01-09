const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Find the customerName section
const start = content.indexOf('.customerName');
const end = content.indexOf('}', start) + 1;
console.log('Found customerName at position:', start);
console.log('Content snippet:');
console.log(JSON.stringify(content.substring(start, end)));
