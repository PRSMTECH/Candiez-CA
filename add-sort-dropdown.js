const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Transactions.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const old = `<option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>`;

const newCode = `<option value="all">All Time</option>
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

if (content.includes(old) && !content.includes('Newest First')) {
  content = content.replace(old, newCode);
  fs.writeFileSync(filePath, content);
  console.log('Added sort dropdown');
} else if (content.includes('Newest First')) {
  console.log('Sort dropdown already exists');
} else {
  console.log('Pattern not found');
}
