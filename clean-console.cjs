const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const storesDir = path.join(__dirname, 'src', 'stores');
const pagesDir = path.join(__dirname, 'src', 'pages');

function removeConsoleLogs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('console.log(') &&
            !trimmed.startsWith('console.error(') &&
            !trimmed.startsWith('console.warn(') &&
            !trimmed.startsWith('console.info(');
    });
    fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf8');
    console.log(`Cleaned: ${path.basename(filePath)}`);
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
            removeConsoleLogs(filePath);
        }
    });
}

console.log('Removing console statements...');
processDirectory(servicesDir);
processDirectory(storesDir);
processDirectory(pagesDir);
console.log('Done!');
