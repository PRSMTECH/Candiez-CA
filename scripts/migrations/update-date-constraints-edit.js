const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerEdit.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add date helper function after the imports if not already present
const dateHelper = `
// Calculate max date (today - cannot be born in future)
const getMaxDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
`;

// Find a good insertion point - after the mockCustomers array
if (!content.includes('getMaxDate')) {
  const insertAfter = "const CustomerEdit = () => {";
  if (content.includes(insertAfter)) {
    content = content.replace(insertAfter, dateHelper + '\n' + insertAfter);
  }
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
}

fs.writeFileSync(filePath, content);
console.log('Updated CustomerEdit.jsx with date constraints');
