const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Insert new styles after .filterSelect
const insertAfter = `.filterSelect {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
}`;

const newStyles = `.filterSelect {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
}

.priceRange {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.priceInput {
  width: 80px;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.priceInput:focus {
  outline: none;
  border-color: var(--color-primary);
}

.priceSeparator {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.clearFiltersButton {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-error, #e74c3c);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-error, #e74c3c);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.clearFiltersButton:hover {
  background: var(--color-error, #e74c3c);
  color: white;
}

.clearFiltersLink {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

.clearFiltersLink:hover {
  color: var(--color-primary-dark);
}`;

content = content.replace(insertAfter, newStyles);
fs.writeFileSync(cssPath, content);
console.log('Products.module.css updated with new filter styles');
