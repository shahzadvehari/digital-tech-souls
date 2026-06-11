const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app');

function walkDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') && !filePath.includes('layout.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove import
      content = content.replace(/import\s+Navbar\s+from\s+['"]@?\/components\/Navbar['"];?\n?/g, '');
      
      // Remove <Navbar />
      content = content.replace(/<Navbar\s*\/>\n?/g, '');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned', filePath);
    }
  }
}

walkDir(dir);
console.log('Done cleaning manual Navbars');
