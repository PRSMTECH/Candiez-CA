const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

const oldStyles = `.cancelButton,
.saveButton {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancelButton {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}`;

const newStyles = `.resetButton,
.cancelButton,
.saveButton {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resetButton {
  background: white;
  border: 1px solid var(--color-warning, #f39c12);
  color: var(--color-warning, #f39c12);
  margin-right: auto;
}

.resetButton:hover:not(:disabled) {
  background: var(--color-warning, #f39c12);
  color: white;
}

.resetButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancelButton {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}`;

content = content.replace(oldStyles, newStyles);

// Also update the disabled styles and media query
content = content.replace(
  `.cancelButton:disabled,
.saveButton:disabled {`,
  `.resetButton:disabled,
.cancelButton:disabled,
.saveButton:disabled {`
);

content = content.replace(
  `.cancelButton,
  .saveButton {
    width: 100%;
  }`,
  `.resetButton,
  .cancelButton,
  .saveButton {
    width: 100%;
  }`
);

fs.writeFileSync(cssPath, content);
console.log('CustomerNew.module.css updated with Reset button styles');
