const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add the exportToCSV function after categories constant
const oldCategories = `const categories = [...new Set(products.map(p => p.category))];`;

const newCategories = `const categories = [...new Set(products.map(p => p.category))];

  // Export filtered/sorted products to CSV
  const exportToCSV = () => {
    // Use sortedProducts (which is already filtered and sorted)
    const headers = ['ID', 'Name', 'Category', 'Strain', 'THC %', 'CBD %', 'Price', 'Unit Price', 'Unit', 'Stock', 'Status'];

    const csvRows = [
      headers.join(','),
      ...sortedProducts.map(product => [
        product.id,
        \`"\${product.name || ''}"\`,
        \`"\${product.category || ''}"\`,
        \`"\${product.strain || ''}"\`,
        product.thcContent || 0,
        product.cbdContent || 0,
        product.price || 0,
        product.unitPrice || 0,
        \`"\${product.unit || ''}"\`,
        product.stock || 0,
        \`"\${product.status || ''}"\`
      ].join(','))
    ];

    const csvContent = csvRows.join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', \`products_export_\${new Date().toISOString().split('T')[0]}.csv\`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

if (content.includes(oldCategories) && !content.includes('exportToCSV')) {
  content = content.replace(oldCategories, newCategories);
  console.log('Added exportToCSV function');
} else if (content.includes('exportToCSV')) {
  console.log('exportToCSV function already exists');
}

// 2. Add Export button next to Add Product button
const oldAddButton = `<Link to="/products/new" className={styles.addButton}>
          + Add Product
        </Link>`;

const newAddButtons = `<div className={styles.headerButtons}>
          <button
            onClick={exportToCSV}
            className={styles.exportButton}
            title="Export filtered products to CSV"
          >
            Export to CSV
          </button>
          <Link to="/products/new" className={styles.addButton}>
            + Add Product
          </Link>
        </div>`;

if (content.includes(oldAddButton) && !content.includes('Export to CSV')) {
  content = content.replace(oldAddButton, newAddButtons);
  console.log('Added Export to CSV button');
}

fs.writeFileSync(filePath, content);
console.log('Saved Products.jsx');
