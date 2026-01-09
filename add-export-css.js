const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(filePath, 'utf8');

// Add styles for headerButtons and exportButton after addButton styles
const addButtonHover = `.addButton:hover {
  background: var(--color-primary-dark);
}`;

const newStyles = `.addButton:hover {
  background: var(--color-primary-dark);
}

.headerButtons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.exportButton {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exportButton:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}`;

if (content.includes(addButtonHover) && !content.includes('.exportButton')) {
  content = content.replace(addButtonHover, newStyles);
  fs.writeFileSync(filePath, content);
  console.log('Added headerButtons and exportButton styles');
} else if (content.includes('.exportButton')) {
  console.log('exportButton styles already exist');
} else {
  console.log('Pattern not found');
}
