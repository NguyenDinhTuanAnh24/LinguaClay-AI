const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint.json', 'utf8'));
data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.ruleId === 'react/no-unescaped-entities' || msg.ruleId === '@typescript-eslint/no-explicit-any') {
      console.log(`${file.filePath}:${msg.line} - ${msg.ruleId}`);
    }
  });
});
