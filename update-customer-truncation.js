const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

const oldStyle = `.customerName {
  font-weight: 600;
  color: var(--color-text-primary);
}`;

const newStyle = `.customerName {
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`;

if (content.includes(oldStyle)) {
  content = content.replace(oldStyle, newStyle);
  fs.writeFileSync(cssPath, content);
  console.log('Updated Customers.module.css with text truncation');
} else if (content.includes('text-overflow: ellipsis')) {
  console.log('Truncation already exists in Customers.module.css');
} else {
  console.log('Could not find customerName style to update');
}
