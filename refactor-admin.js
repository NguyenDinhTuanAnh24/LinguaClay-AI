const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const apiAdminDir = path.join(__dirname, 'app', 'api', 'admin');
const files = walk(apiAdminDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

let adminAuthImported = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex to remove the entire block of ensureAdminActor function
  const ensureAdminRegex = /async function ensureAdminActor\(\) \{[\s\S]*?\n\}/;
  if (ensureAdminRegex.test(content)) {
    content = content.replace(ensureAdminRegex, '');
    
    // add import statement if not exists
    if (!content.includes('ensureAdminActor')) {
        // oops, wait, it's used inside the file as ensureAdminActor()
    }
    
    // add import from @/lib/admin-auth
    if (!content.includes('@/lib/admin-auth')) {
        content = "import { ensureAdminActor } from '@/lib/admin-auth'\n" + content;
    }

    fs.writeFileSync(file, content);
    console.log('Fixed avoid duplication of ensureAdminActor in: ' + file);
    adminAuthImported++;
  }
}
