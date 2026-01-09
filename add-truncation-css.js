const fs = require('fs');

// Update Products.module.css
const productsCss = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.module.css';
let productsContent = fs.readFileSync(productsCss, 'utf8');

// Update productName to have truncation
const oldProductName = `.productName {
  font-weight: 600;
  color: var(--color-text-primary);
}`;

const newProductName = `.productName {
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`;

productsContent = productsContent.replace(oldProductName, newProductName);
fs.writeFileSync(productsCss, productsContent);
console.log('Updated Products.module.css with text truncation');

// Update Customers.module.css
const customersCss = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.module.css';
let customersContent = fs.readFileSync(customersCss, 'utf8');

// Check if customerName exists and update it
if (customersContent.includes('.customerName')) {
  const oldCustomerName = `.customerName {
  font-weight: 600;
  color: var(--color-text-primary);
}`;

  const newCustomerName = `.customerName {
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`;

  if (customersContent.includes(oldCustomerName)) {
    customersContent = customersContent.replace(oldCustomerName, newCustomerName);
    fs.writeFileSync(customersCss, customersContent);
    console.log('Updated Customers.module.css with text truncation');
  } else {
    console.log('Customer name CSS pattern not found, skipping');
  }
} else {
  console.log('customerName class not found in Customers.module.css');
}
