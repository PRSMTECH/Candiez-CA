const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add date helper function inside the component, after the useState declarations
const dateHelper = `
  // Calculate max date (today - cannot be born in future)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
`;

// Insert after the fieldErrors useState
const insertAfter = 'const [fieldErrors, setFieldErrors] = useState({});';
if (content.includes(insertAfter) && !content.includes('getMaxDate')) {
  content = content.replace(insertAfter, insertAfter + '\n' + dateHelper);
  fs.writeFileSync(filePath, content);
  console.log('Added getMaxDate helper function to CustomerNew.jsx');
} else if (content.includes('getMaxDate')) {
  console.log('getMaxDate already exists');
} else {
  console.log('Could not find insertion point');
}
