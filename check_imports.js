const fs = require('fs');
const path = require('path');

function checkImports(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const dir = path.dirname(file);
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const imp = match[1];
    if (imp.startsWith('.')) {
      const resolved = path.resolve(dir, imp);
      const candidates = [resolved + '.js', resolved + '.jsx', resolved + '/index.js', resolved + '/index.jsx'];
      const found = candidates.some(c => fs.existsSync(c));
      if (!found) {
        console.log('MISSING:', file, '->', imp);
      }
    }
  }
}

const files = [
  'src/pages/Distribuicao.jsx',
  'src/hooks/useDistribuicao.js',
  'src/components/layout/AppLayout.jsx',
  'src/components/layout/Sidebar.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/components/layout/Header.jsx',
  'src/components/DistributionPreview.jsx',
  'src/lib/supabase.js'
];

files.forEach(f => checkImports(f));
console.log('Import check done');
