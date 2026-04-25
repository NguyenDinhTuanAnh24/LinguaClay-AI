const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'app/(marketing)/page.tsx');
const content = fs.readFileSync(pageFile, 'utf8');

// We will split the file into smaller sections.
// But writing a correct regex in JS to split JSX is fraught with bugs.
// Let's just do a simpler refactor for the admin files.
