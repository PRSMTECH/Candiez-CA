const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add date helper function
const oldCode = `const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {`;

const newCode = `const [fieldErrors, setFieldErrors] = useState({});

  // Calculate max date (today - cannot be born in future)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleChange = (e) => {`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content);
  console.log('Added getMaxDate function');
} else {
  console.log('Pattern not found - checking if already exists...');
  if (content.includes('const getMaxDate = ()')) {
    console.log('getMaxDate function already exists');
  } else {
    console.log('Need to investigate further');
  }
}
