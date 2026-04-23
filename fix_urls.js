const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const API_URL_REPLACEMENT = "${process.env.REACT_APP_API_URL || 'http://localhost:5000'}";

const files = walk(path.join(__dirname, 'frontend/src'));
let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // Handle template literals `http://localhost:5000/...`
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${process.env.REACT_APP_API_URL || \'http://localhost:5000\'}$1`');
    
    // Handle standard string literals 'http://localhost:5000/...'
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '(process.env.REACT_APP_API_URL || \'http://localhost:5000\') + \'$1\'');
    
    // Handle standard string literals "http://localhost:5000/..."
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '(process.env.REACT_APP_API_URL || "http://localhost:5000") + "$1"');
    
    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
    console.log(`Replaced in ${file}`);
  }
});

console.log(`Done! Updated ${replacedCount} files.`);
