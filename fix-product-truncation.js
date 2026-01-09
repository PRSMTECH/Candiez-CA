const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Handle Windows line endings
const oldStyle = `.productName {\r\n  font-weight: 600;\r\n  color: var(--color-text-primary);\r\n}`;

const newStyle = `.productName {\r\n  font-weight: 600;\r\n  color: var(--color-text-primary);\r\n  max-width: 250px;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}`;

if (content.includes(oldStyle)) {
  content = content.replace(oldStyle, newStyle);
  fs.writeFileSync(cssPath, content);
  console.log('Updated Products.module.css with text truncation');
} else if (content.includes('text-overflow: ellipsis')) {
  console.log('Truncation already exists in Products.module.css');
} else {
  console.log('Could not find productName style to update, trying Unix line endings');

  // Try Unix line endings
  const oldStyleUnix = `.productName {\n  font-weight: 600;\n  color: var(--color-text-primary);\n}`;
  const newStyleUnix = `.productName {\n  font-weight: 600;\n  color: var(--color-text-primary);\n  max-width: 250px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}`;

  if (content.includes(oldStyleUnix)) {
    content = content.replace(oldStyleUnix, newStyleUnix);
    fs.writeFileSync(cssPath, content);
    console.log('Updated Products.module.css with text truncation (Unix line endings)');
  } else {
    console.log('Could not find pattern');
  }
}
