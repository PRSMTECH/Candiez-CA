const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add date helper functions after the imports
const dateHelpers = `
// Calculate max date (today - cannot be born in future)
const getMaxDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Calculate min date for 21+ (today - 21 years, for hint purposes)
const getMinDateFor21 = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 21);
  return date.toISOString().split('T')[0];
};
`;

// Insert after the phone validation regex (line ~31)
const insertAfter = "// (999) 999-9999, etc.\nconst PHONE_REGEX = /^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$/;";
if (content.includes(insertAfter) && !content.includes('getMaxDate')) {
  content = content.replace(insertAfter, insertAfter + dateHelpers);
}

// Update the date input to add max constraint
const oldDateInput = `<input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.input}
                required
              />`;

const newDateInput = `<input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.input}
                required
                max={getMaxDate()}
              />`;

if (content.includes(oldDateInput)) {
  content = content.replace(oldDateInput, newDateInput);
  fs.writeFileSync(filePath, content);
  console.log('Updated CustomerNew.jsx with date constraints');
} else {
  console.log('Could not find exact date input pattern');
  // Try a more flexible approach
  if (!content.includes('max={getMaxDate()}')) {
    content = content.replace(
      /(<input\s+type="date"\s+id="dateOfBirth"[^>]*)(required\s*\/>)/,
      '$1required\n                max={getMaxDate()}\n              />'
    );
    fs.writeFileSync(filePath, content);
    console.log('Updated with regex approach');
  }
}
