const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Check if resetButton already exists
if (!content.includes('.resetButton')) {
  // Update the button grouping to include resetButton
  content = content.replace(
    `.cancelButton,
.saveButton {`,
    `.resetButton,
.cancelButton,
.saveButton {`
  );

  // Add resetButton specific styles after cancelButton styles
  const cancelButtonStyles = `.cancelButton {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}`;

  const newCancelButtonStyles = `.resetButton {
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

  content = content.replace(cancelButtonStyles, newCancelButtonStyles);

  // Update disabled styles
  content = content.replace(
    `.cancelButton:disabled,
.saveButton:disabled {`,
    `.resetButton:disabled,
.cancelButton:disabled,
.saveButton:disabled {`
  );

  // Update responsive styles
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
  console.log('Added resetButton CSS styles');
} else {
  console.log('resetButton styles already exist');
}
