const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Transactions.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find "This Month" and the closing of filters div
const searchFor = '<option value="month">This Month</option>\n        </select>\n      </div>';
const replaceWith = `<option value="month">This Month</option>
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

if (content.includes(searchFor) && !content.includes('Newest First')) {
  content = content.replace(searchFor, replaceWith);
  fs.writeFileSync(filePath, content);
  console.log('Added sort dropdown');
} else if (content.includes('Newest First')) {
  console.log('Already has sort dropdown');
} else {
  // Try finding and appending after the month option
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('This Month')) {
      // Found the line, insert after the next two lines
      const insertAt = i + 2;
      const sortDropdown = `        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>`;
      lines.splice(insertAt, 0, sortDropdown);
      content = lines.join('\n');
      fs.writeFileSync(filePath, content);
      console.log('Added sort dropdown via line insertion');
      break;
    }
  }
}
