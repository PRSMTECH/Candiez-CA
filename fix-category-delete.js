const fs = require('fs');
const path = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/server/src/index.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /is_active = 0, updated_at = datetime\('now'\) WHERE id/g,
  'is_active = 0 WHERE id'
);
fs.writeFileSync(path, content);
console.log('Fixed category delete SQL query');
