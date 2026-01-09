const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Add field error styles after .hint
const insertAfter = `.hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}`;

const newStyles = `.hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.inputError {
  border-color: var(--color-error) !important;
}

.inputError:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
}

.fieldError {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.25rem;
  display: block;
}`;

content = content.replace(insertAfter, newStyles);

fs.writeFileSync(cssPath, content);
console.log('CustomerNew.module.css updated with field error styles');
