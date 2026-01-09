const fs = require('fs');

const filePath = 'J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update firstName error - add role="alert" and aria-live, and aria-describedby to input
content = content.replace(
  /<span className=\{styles\.fieldError\}>\{fieldErrors\.firstName\}<\/span>/g,
  '<span id="firstName-error" role="alert" aria-live="assertive" className={styles.fieldError}>{fieldErrors.firstName}</span>'
);

// Add aria-describedby to firstName input
content = content.replace(
  /id="firstName"\s+name="firstName"/g,
  'id="firstName" name="firstName" aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}'
);

// Update lastName error
content = content.replace(
  /<span className=\{styles\.fieldError\}>\{fieldErrors\.lastName\}<\/span>/g,
  '<span id="lastName-error" role="alert" aria-live="assertive" className={styles.fieldError}>{fieldErrors.lastName}</span>'
);

content = content.replace(
  /id="lastName"\s+name="lastName"/g,
  'id="lastName" name="lastName" aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}'
);

// Update email error
content = content.replace(
  /<span className=\{styles\.fieldError\}>\{fieldErrors\.email\}<\/span>/g,
  '<span id="email-error" role="alert" aria-live="assertive" className={styles.fieldError}>{fieldErrors.email}</span>'
);

content = content.replace(
  /id="email"\s+name="email"/g,
  'id="email" name="email" aria-describedby={fieldErrors.email ? "email-error" : undefined}'
);

// Update phone error
content = content.replace(
  /<span className=\{styles\.fieldError\}>\{fieldErrors\.phone\}<\/span>/g,
  '<span id="phone-error" role="alert" aria-live="assertive" className={styles.fieldError}>{fieldErrors.phone}</span>'
);

content = content.replace(
  /id="phone"\s+name="phone"/g,
  'id="phone" name="phone" aria-describedby={fieldErrors.phone ? "phone-error" : undefined}'
);

fs.writeFileSync(filePath, content);
console.log('Updated CustomerNew.jsx with ARIA accessibility attributes');
