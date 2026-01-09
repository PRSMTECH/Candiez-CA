const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Customers.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add the exportToCSV function after getPageNumbers function
const oldGetPageNumbers = `// Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };`;

const newGetPageNumbers = `// Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Export all customers to CSV
  const exportToCSV = () => {
    // Use all customers, not just filtered/paginated
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Loyalty Points', 'Loyalty Tier', 'Total Purchases', 'Date of Birth', 'Created At'];

    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        customer.id,
        \`"\${customer.firstName || ''}"\`,
        \`"\${customer.lastName || ''}"\`,
        \`"\${customer.email || ''}"\`,
        \`"\${customer.phone || ''}"\`,
        customer.status || '',
        customer.loyaltyPoints || 0,
        customer.loyaltyTier || 'bronze',
        customer.totalPurchases || 0,
        customer.dateOfBirth || '',
        customer.createdAt || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', \`customers_export_\${new Date().toISOString().split('T')[0]}.csv\`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

if (content.includes(oldGetPageNumbers) && !content.includes('exportToCSV')) {
  content = content.replace(oldGetPageNumbers, newGetPageNumbers);
  console.log('Added exportToCSV function');
} else if (content.includes('exportToCSV')) {
  console.log('exportToCSV function already exists');
}

// 2. Add Export button next to Add Customer button
const oldAddButton = `<Link to="/customers/new" className={styles.addButton}>
          + Add Customer
        </Link>`;

const newAddButtons = `<div className={styles.headerButtons}>
          <button
            onClick={exportToCSV}
            className={styles.exportButton}
            title="Export all customers to CSV"
          >
            Export to CSV
          </button>
          <Link to="/customers/new" className={styles.addButton}>
            + Add Customer
          </Link>
        </div>`;

if (content.includes(oldAddButton) && !content.includes('Export to CSV')) {
  content = content.replace(oldAddButton, newAddButtons);
  console.log('Added Export to CSV button');
}

fs.writeFileSync(filePath, content);
console.log('Saved Customers.jsx');
