const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Check if inputError already exists
if (!content.includes('.inputError')) {
  // Add validation error styles after the focus styles
  const focusStyles = `.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}`;

  const newFocusStyles = `.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.inputError {
  border-color: var(--color-error);
}

.inputError:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
}

.fieldError {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}`;

  content = content.replace(focusStyles, newFocusStyles);
  fs.writeFileSync(cssPath, content);
  console.log('Added validation error CSS styles');
} else {
  console.log('Validation error styles already exist');
}
