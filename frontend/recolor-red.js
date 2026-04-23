
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace the blues I just added back to the vibrant red from the image
    content = content.replace(/#1d4ed8/ig, '#e43b2c'); // Royal blue -> Red
    content = content.replace(/#1e3a8a/ig, '#c42e22'); // Darker blue -> Darker red
    content = content.replace(/#0a2540/ig, '#0f172a'); // Keep navy for text if it looks good, or change to black/red? Screenshot shows black text.
    
    // Special case for the hero/post property
    content = content.replace(/#f0f9ff/ig, '#fffafa'); // Light blue background -> Very light red tint or white
    content = content.replace(/#bae6fd/ig, '#fecaca'); // Light blue border -> Soft red

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated to red: ' + filePath);
    }
  }
});

