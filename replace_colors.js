import fs from 'fs';
import path from 'path';

const SRC_DIR = './'; // Run this from project root
const FILE_EXTENSIONS = ['.tsx', '.ts', '.css', '.html'];

// Using Regex to ensure we match full class names and avoid partial word matches
// e.g., we want to match bg-charcoal, text-charcoal-800, border-gold-400
// but not accidentally match something like "charcoalGrill" if it exists in text.
const REPLACEMENTS = [
    // Charcoal -> Forest
    { regex: /charcoal-900/g, replacement: 'forest-900' },
    { regex: /charcoal-800/g, replacement: 'forest-800' },
    { regex: /charcoal-700/g, replacement: 'forest-700' },
    { regex: /charcoal-600/g, replacement: 'forest-600' },
    { regex: /charcoal-500/g, replacement: 'forest-500' },
    { regex: /charcoal-400/g, replacement: 'forest-400' },
    { regex: /charcoal-300/g, replacement: 'forest-300' },
    { regex: /charcoal-200/g, replacement: 'forest-200' },
    { regex: /charcoal-100/g, replacement: 'forest-100' },
    { regex: /charcoal-50/g, replacement: 'forest-50' },
    { regex: /(?<!-)charcoal(?!-)/g, replacement: 'forest-900' }, // "charcoal" -> "forest-900" (Assuming default charcoal was 900 weight)

    // Gold -> Emerald
    { regex: /gold-900/g, replacement: 'emerald-900' },
    { regex: /gold-800/g, replacement: 'emerald-800' },
    { regex: /gold-700/g, replacement: 'emerald-700' },
    { regex: /gold-600/g, replacement: 'emerald-600' },
    { regex: /gold-500/g, replacement: 'emerald-500' },
    { regex: /gold-400/g, replacement: 'emerald-400' },
    { regex: /gold-300/g, replacement: 'emerald-300' },
    { regex: /gold-200/g, replacement: 'emerald-200' },
    { regex: /gold-100/g, replacement: 'emerald-100' },
    { regex: /gold-50/g, replacement: 'emerald-50' },
    { regex: /(?<!-)gold(?!-)/g, replacement: 'emerald-500' }, // "gold" -> "emerald-500" 
];


function walkSync(currentDirPath, callback) {
    if (currentDirPath.includes('node_modules') || currentDirPath.includes('.git') || currentDirPath.includes('dist')) {
        return;
    }

    fs.readdirSync(currentDirPath).forEach((name) => {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!FILE_EXTENSIONS.includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    REPLACEMENTS.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log("Starting color replacement script...");
walkSync(SRC_DIR, (filePath) => {
    processFile(filePath);
});
console.log("Finished replacing colors.");
