import fs from 'fs';

const path = './src/pages/Home.tsx';
const content = fs.readFileSync(path, 'utf-8');
const lines = content.split('\n');

// Why We Are Chosen starts at 177 (index 176) and goes to 210 (index 209). 
// That's 34 lines total.
const chosenSection = lines.splice(176, 34);

// Now the array is shorter by 34 lines.
// Old line 294 (end of Featured Journeys) is at index 293.
// With 34 lines removed before it, its new index is 293 - 34 = 259.
// We want to insert the chosenSection *after* this section.
// So we insert at index 260.

lines.splice(260, 0, ...chosenSection);

fs.writeFileSync(path, lines.join('\n'));
console.log('Sections reordered successfully!');
