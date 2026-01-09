const fs = require('fs');

const cssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Add touch target styles after existing media query
const touchTargetStyles = `

  /* Mobile Touch Targets - 44px minimum */
  .viewButton,
  .editButton,
  .deleteButton {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem 0.75rem;
  }

  .pageButton {
    min-height: 44px;
    min-width: 44px;
  }

  .pageNumber {
    width: 44px;
    height: 44px;
  }

  .filterSelect {
    min-height: 44px;
  }

  .searchInput {
    min-height: 44px;
  }

  .addButton {
    min-height: 44px;
  }`;

// Find the closing brace of the media query
if (content.includes('Mobile Touch Targets')) {
  console.log('Already has touch targets');
} else {
  // Find the media query and insert before the closing brace
  const mediaStart = content.indexOf('@media (max-width: 768px)');
  if (mediaStart !== -1) {
    // Find the closing brace of this media query
    let braceCount = 0;
    let inMedia = false;
    let insertPos = -1;

    for (let i = mediaStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inMedia = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inMedia && braceCount === 0) {
          insertPos = i;
          break;
        }
      }
    }

    if (insertPos !== -1) {
      content = content.slice(0, insertPos) + touchTargetStyles + '\n' + content.slice(insertPos);
      fs.writeFileSync(cssPath, content);
      console.log('Updated Customers.module.css with mobile touch targets');
    }
  }
}
