const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'app', '(marketing)');
const files = [
  'company/contact/page.tsx',
  'product/flashcard/page.tsx',
  'product/grammar/page.tsx',
  'product/features/page.tsx',
  'company/about/page.tsx',
  'product/faq/page.tsx',
  'product/ai-tutor/page.tsx',
  'blog/[slug]/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('href="/login"')) {
      // Add import AuthTrigger if not exists
      if (!content.includes('AuthTrigger')) {
        content = content.replace(/import Link from 'next\/link'/, "import Link from 'next/link'\nimport AuthTrigger from '@/components/marketing/AuthTrigger'");
      }
      
      const regex = /<Link\s+href="\/login"([^>]*)>([\s\S]*?)<\/Link>/g;
      content = content.replace(regex, '<AuthTrigger tab="signin"$1>$2</AuthTrigger>');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${f}`);
    }
  }
});
