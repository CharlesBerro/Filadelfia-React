const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const hooksDir = path.join(__dirname, 'src', 'hooks');

function removeConsoleLogs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('console.log(') &&
            !trimmed.startsWith('console.error(') &&
            !trimmed.startsWith('console.warn(') &&
            !trimmed.startsWith('console.info(') &&
            !trimmed.startsWith('//   console.');
    });
    fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf8');
    console.log(`Cleaned: ${path.basename(filePath)}`);
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            removeConsoleLogs(filePath);
        }
    });
}

console.log('Removing console statements from components and hooks...');
processDirectory(componentsDir);
processDirectory(hooksDir);
console.log('Done!');
