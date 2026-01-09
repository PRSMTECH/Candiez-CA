const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Handle Windows line endings
const oldStyle = `.customerName {\r\n  font-weight: 600;\r\n  color: var(--color-text-primary);\r\n}`;

const newStyle = `.customerName {\r\n  font-weight: 600;\r\n  color: var(--color-text-primary);\r\n  max-width: 200px;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}`;

if (content.includes(oldStyle)) {
  content = content.replace(oldStyle, newStyle);
  fs.writeFileSync(cssPath, content);
  console.log('Updated Customers.module.css with text truncation');
} else if (content.includes('text-overflow: ellipsis')) {
  console.log('Truncation already exists in Customers.module.css');
} else {
  console.log('Could not find customerName style to update');
}
