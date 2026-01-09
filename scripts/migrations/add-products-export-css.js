const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let content = fs.readFileSync(filePath, 'utf8');

// Append styles to end of file
if (!content.includes('.headerButtons')) {
  const newStyles = `

/* Header buttons container */
.headerButtons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Export to CSV button */
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
}

@media (max-width: 768px) {
  .headerButtons {
    flex-wrap: wrap;
  }

  .exportButton {
    min-height: 44px;
  }
}
`;

  content = content.trimEnd() + newStyles;
  fs.writeFileSync(filePath, content);
  console.log('Added export button CSS styles to Products.module.css');
} else {
  console.log('Export button CSS styles already exist');
}
