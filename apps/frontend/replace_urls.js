const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacement = "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}";

walkDir('src', function(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:3001')) {
    
    // Replace template literals: `http://localhost:3001 -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
    content = content.replace(/`http:\/\/localhost:3001/g, replacement);
    
    // Replace single quotes: 'http://localhost:3001/foo' -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/foo`
    content = content.replace(/'http:\/\/localhost:3001([^']*)'/g, replacement + "$1`");
    
    // Replace double quotes: "http://localhost:3001/foo" -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/foo`
    content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, replacement + "$1`");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
