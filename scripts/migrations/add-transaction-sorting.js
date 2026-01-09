const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Transactions.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add sortOrder state after dateFilter state
const oldState = `const [dateFilter, setDateFilter] = useState('all');`;
const newState = `const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' = oldest first, 'desc' = newest first`;

if (content.includes(oldState) && !content.includes('sortOrder')) {
  content = content.replace(oldState, newState);
}

// 2. Modify filteredTransactions to include sorting
const oldFilteredLogic = `const filteredTransactions = transactions.filter(txn => {`;

// First find and backup the entire filteredTransactions declaration
const filterStart = content.indexOf('const filteredTransactions = transactions.filter');
const filterEnd = content.indexOf('return matchesSearch && matchesStatus && matchesDate;');
if (filterStart !== -1 && filterEnd !== -1) {
  const closingBracePos = content.indexOf('});', filterEnd);

  // Insert sort after the filter
  const sortingCode = `.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  })`;

  if (!content.includes('.sort((a, b)')) {
    // Find the end of the filter chain
    const insertPos = closingBracePos + 2;
    content = content.slice(0, insertPos) + sortingCode + content.slice(insertPos);
  }
}

// 3. Add sort dropdown after the dateFilter dropdown
const oldDateSelect = `<select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>`;

const newDateSelect = `<select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>`;

if (content.includes(oldDateSelect) && !content.includes('Newest First')) {
  content = content.replace(oldDateSelect, newDateSelect);
}

fs.writeFileSync(filePath, content);
console.log('Added transaction sorting functionality');
