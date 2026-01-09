const fs = require('fs');

// Update Customers.module.css
const customersCssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let customersContent = fs.readFileSync(customersCssPath, 'utf8');

// Find the mobile media query and enhance it
const oldCustomersMedia = `@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .addButton {
    text-align: center;
    justify-content: center;
  }

  .tableWrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 700px;
  }
}`;

const newCustomersMedia = `@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .addButton {
    text-align: center;
    justify-content: center;
    min-height: 44px;
  }

  .tableWrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 700px;
  }

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
}`;

if (customersContent.includes(oldCustomersMedia)) {
  customersContent = customersContent.replace(oldCustomersMedia, newCustomersMedia);
  fs.writeFileSync(customersCssPath, customersContent);
  console.log('Updated Customers.module.css with mobile touch targets');
} else if (customersContent.includes('Mobile Touch Targets')) {
  console.log('Customers.module.css already has mobile touch targets');
} else {
  console.log('Could not find exact media query pattern in Customers.module.css');
}

// Update Products.module.css
const productsCssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let productsContent = fs.readFileSync(productsCssPath, 'utf8');

// Check if mobile touch targets already exist
if (!productsContent.includes('Mobile Touch Targets')) {
  const mobileTouchTargets = `
/* Mobile Touch Targets - 44px minimum */
@media (max-width: 768px) {
  .addButton {
    min-height: 44px;
  }

  .viewButton,
  .editButton,
  .deleteButton {
    min-height: 44px;
    min-width: 44px;
  }

  .pageButton {
    min-height: 44px;
    min-width: 44px;
  }

  .pageNumber {
    width: 44px;
    height: 44px;
  }

  .filterSelect,
  .searchInput {
    min-height: 44px;
  }
}
`;
  productsContent = productsContent.trimEnd() + '\n' + mobileTouchTargets;
  fs.writeFileSync(productsCssPath, productsContent);
  console.log('Updated Products.module.css with mobile touch targets');
} else {
  console.log('Products.module.css already has mobile touch targets');
}

// Update Categories.module.css if it exists
const categoriesCssPath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Categories.module.css';
try {
  let categoriesContent = fs.readFileSync(categoriesCssPath, 'utf8');

  if (!categoriesContent.includes('Mobile Touch Targets')) {
    const mobileTouchTargets = `
/* Mobile Touch Targets - 44px minimum */
@media (max-width: 768px) {
  .addButton {
    min-height: 44px;
  }

  .editButton,
  .deleteButton {
    min-height: 44px;
    min-width: 44px;
  }

  .searchInput {
    min-height: 44px;
  }
}
`;
    categoriesContent = categoriesContent.trimEnd() + '\n' + mobileTouchTargets;
    fs.writeFileSync(categoriesCssPath, categoriesContent);
    console.log('Updated Categories.module.css with mobile touch targets');
  } else {
    console.log('Categories.module.css already has mobile touch targets');
  }
} catch (e) {
  console.log('Categories.module.css not found or error:', e.message);
}

console.log('Done!');
