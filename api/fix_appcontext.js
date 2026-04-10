const fs = require('fs');
const file = '/Users/muzamilirfan/Library/Mobile Documents/com~apple~CloudDocs/Muzamil Irfan/Hunar Asaan CRM 6/src/context/AppContext.jsx';
let content = fs.readFileSync(file, 'utf8');

// We need to fix the error message shown in toasts
// We will replace `error.message || 'Failed to add student'` with `error.response?.data?.error || error.message || 'Failed to add student'`
content = content.replace(
  /toast\.error\(error\.message \|\| 'Failed to add student'\);/g,
  "toast.error(error.response?.data?.error || error.message || 'Failed to add student');"
);
content = content.replace(
  /toast\.error\(error\.message \|\| 'Failed to update student'\);/g,
  "toast.error(error.response?.data?.error || error.message || 'Failed to update student');"
);
content = content.replace(
  /toast\.error\(error\.message \|\| 'Failed to add expense'\);/g,
  "toast.error(error.response?.data?.error || error.message || 'Failed to add expense');"
);
content = content.replace(
  /toast\.error\(err\.message \|\| 'Failed to delete student'\);/g,
  "toast.error(err.response?.data?.error || err.message || 'Failed to delete student');"
);
fs.writeFileSync(file, content);
console.log("AppContext fixed");
