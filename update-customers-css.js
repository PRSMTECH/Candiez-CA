const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

const paginationStyles = `
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.pageButton {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pageButton:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.pageButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pageNumbers {
  display: flex;
  gap: 0.5rem;
}

.pageNumber {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pageNumber:hover {
  background: var(--color-bg-light);
  border-color: var(--color-primary);
}

.pageNumber.pageActive {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.pageInfo {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

`;

// Insert pagination styles before .userNote
content = content.replace(
  '.userNote {',
  paginationStyles + '.userNote {'
);

fs.writeFileSync(cssPath, content);
console.log('Customers.module.css updated with pagination styles');
