import fs from 'fs';
import path from 'path';

function removeItalic(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeItalic(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      // Remove class "italic" preserving spaces
      content = content.replace(/\bitalic\b/g, '');
      // Clean up multiple spaces that might have been created
      content = content.replace(/className="([^"]*)"/g, (match, classes) => {
        return `className="${classes.replace(/\s+/g, ' ').trim()}"`;
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

removeItalic('./src');
console.log('Removed all italic classes!');
