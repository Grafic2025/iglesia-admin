const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next') && !fullPath.includes('font')) {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Reemplazar utilidades específicas de tailwind
            const terms = ['bg', 'text', 'border', 'ring', 'fill', 'stroke', 'from', 'via', 'to', 'shadow'];
            
            terms.forEach(term => {
                // Regex para capturar cosas como bg-[var(--accent)] o hover:bg-[var(--accent)]/50
                // Match exacto en tsx
                const regex = new RegExp(term + '-\\[var\\(--accent\\)\\]', 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, term + '-accent');
                    changed = true;
                }
            });

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed:', fullPath);
            }
        }
    });
}

processDir('.');
console.log('Terminado');
