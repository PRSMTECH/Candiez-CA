const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Add sortSelect style after clearFiltersLink
const insertAfter = `.clearFiltersLink:hover {
  color: var(--color-primary-dark);
}`;

const newStyles = `.clearFiltersLink:hover {
  color: var(--color-primary-dark);
}

.sortSelect {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  font-size: 0.875rem;
  min-width: 160px;
  cursor: pointer;
}

.sortSelect:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}`;

content = content.replace(insertAfter, newStyles);

fs.writeFileSync(cssPath, content);
console.log('Products.module.css updated with sort select styles');
