const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/ProductNew.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Check if imageUploadArea already exists
if (!content.includes('.imageUploadArea')) {
  const uploadStyles = `
/* Image Upload Styles */
.imageUploadArea {
  margin-top: 0.5rem;
}

.uploadPlaceholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-light);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.uploadPlaceholder:hover {
  border-color: var(--color-primary);
  background: rgba(108, 92, 231, 0.05);
}

.uploadIcon {
  font-size: 2rem;
}

.uploadHint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.fileInput {
  display: none;
}

.imagePreviewContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-light);
}

.imagePreview {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.removeImageBtn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--color-error);
  color: var(--color-error);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.removeImageBtn:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

.removeImageBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress Bar Styles */
.progressContainer {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-bg-light);
  border-radius: var(--radius-md);
}

.progressLabel {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.progressBar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progressComplete {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-success);
  font-weight: 500;
}
`;

  // Add before the @media query
  content = content.replace('@media (max-width: 768px)', uploadStyles + '\n@media (max-width: 768px)');
  fs.writeFileSync(cssPath, content);
  console.log('Added image upload CSS styles');
} else {
  console.log('Image upload styles already exist');
}
