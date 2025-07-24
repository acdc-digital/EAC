// Quick syntax check
const fs = require('fs');
const path = require('path');

const filePath = '/Users/matthewsimon/Projects/eac/eac/app/_components/calendar/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Count brackets and parentheses
let openBrace = 0, closeBrace = 0;
let openParen = 0, closeParen = 0;
let openBracket = 0, closeBracket = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    switch (char) {
        case '{': openBrace++; break;
        case '}': closeBrace++; break;
        case '(': openParen++; break;
        case ')': closeParen++; break;
        case '[': openBracket++; break;
        case ']': closeBracket++; break;
    }
}

console.log('Bracket counts:');
console.log(`{ : ${openBrace}, } : ${closeBrace}, diff: ${openBrace - closeBrace}`);
console.log(`( : ${openParen}, ) : ${closeParen}, diff: ${openParen - closeParen}`);
console.log(`[ : ${openBracket}, ] : ${closeBracket}, diff: ${openBracket - closeBracket}`);
