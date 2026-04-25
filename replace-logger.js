const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      if (content.includes('console.log') || content.includes('console.error')) {
        content = content.replace(/console\.log/g, 'logger.info');
        content = content.replace(/console\.error/g, 'logger.error');
        modified = true;
      }
      
      if (modified) {
        if (!content.includes("import { logger }")) {
           content = "import { logger } from '@/lib/logger'\n" + content;
        }
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app', 'api'));
