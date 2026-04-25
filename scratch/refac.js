const fs = require('fs');
const glob = require('glob');
const path = require('path');

const API_DIR = path.join(__dirname, 'app/api/admin');
const files = glob.sync(`${API_DIR}/**/*.ts`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add the import if not exists
  if (!content.includes('import { ensureAdminActor }') && content.includes('createClient()')) {
    content = content.replace(
      /^import \{ (.*?) \} from '@\/utils\/supabase\/server'/m,
      "import { ensureAdminActor } from '@/lib/admin-auth'\nimport { $1 } from '@/utils/supabase/server'"
    );
    if (!content.includes('import { ensureAdminActor }')) {
      content = "import { ensureAdminActor } from '@/lib/admin-auth'\n" + content;
    }
  }

  // Common pattern: inline check with createClient() and prisma.user.findUnique
  // We can use a regex to match the whole auth block.
  // The block typically starts with `const supabase = await createClient()` or `const actor = await prisma.user.findUnique`
  
  // Pattern 1:
  const authBlock1 = /const\s+supabase\s*=\s*await\s+createClient\(\)[\s\S]*?(?:if\s*\(!actor\s*\|\|\s*\(actor\s+as\s+\{\s*role\?:\s*string\s*\}\)\.role\s*!==\s*'ADMIN'\)[\s\S]*?\}|return\s+null[\s\S]*?\}[\s\S]*?\})/g;
  
  // This might be tricky. Let's make it simpler and specific just to ensureAdmin functions
  if (content.includes('async function ensureAdmin(')) {
    content = content.replace(/async function ensureAdmin\(\) \{[\s\S]*?return user\n\}/m, '');
    content = content.replace(/await ensureAdmin\(\)/g, "await ensureAdminActor()");
    changed = true;
  }
  
  if (content.includes("role !== 'ADMIN'")) {
    // We just find the block by hand to be safe or replace known strings
    // In manage route:
    const manageAuthBlock = /const supabase = await createClient\(\)[\s\S]*?catch \{\s*\/\/ Backward compatibility[\s\S]*?\}/;
    if (manageAuthBlock.test(content)) {
      content = content.replace(manageAuthBlock,  
        "const admin = await ensureAdminActor()\n    if (!admin) {\n      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })\n    }");
      changed = true;
    }
    
    const inlineAuthReturnNull = /const supabase = await createClient\(\)[\s\S]*?Catch \{\s*\}\s*return user/;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Refactored', file);
  }
});
