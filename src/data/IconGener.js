const path = require('path');
const { writeFile } = require('fs').promises;
const fs = require('fs');

// Updated paths for directories and files
const iconDir = path.join(__dirname, '../assets/icons'); // Updated icon directory path
const iconFiles = fs.readdirSync(iconDir).filter(file => file.endsWith('.svg')); // Filter to include only SVG files

const importStatements = iconFiles.map((file) => {
  const Name = path.basename(file, '.svg');
  return `import { ReactComponent as ${Name} } from '../assets/icons/${file}';`; // Adjusted import path
});

const iconMap = iconFiles.map((file) => {
  const Name = path.basename(file, '.svg');
  return `  '${Name}': ${Name},`;
});

const output = `
import React from 'react';

${importStatements.join('\n')}

const iconComponents = {
${iconMap.join('\n')}
};

const SvgIcn = ({ Name, ...props }) => {
  const SelectedIcon = iconComponents[Name];
  if (!SelectedIcon) {
    console.warn(\`Icon "\${Name}" not found\`);
    return null; // Or a default icon
  }

  return <SelectedIcon {...props} />;
};

export default SvgIcn;
`;

const outputFilePath = path.join(__dirname, './IconCompo.js'); // Updated output file path

(async () => {
  try {
    await writeFile(outputFilePath, output, 'utf-8');
    console.log(`File written to ${outputFilePath}`);
  } catch (err) {
    console.error('Error writing file:', err);
  }
})();
