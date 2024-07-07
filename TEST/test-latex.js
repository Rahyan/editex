// test-latex.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const content = `
\\documentclass{article}
\\begin{document}
Hello, World!
\\end{document}
`;

const inputPath = path.join(__dirname, 'test.tex');
const outputPath = path.join(__dirname, 'test.pdf');

fs.writeFileSync(inputPath, content);

exec(`pdflatex -output-directory=${path.dirname(outputPath)} ${inputPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
  console.log(`PDF generated at: ${outputPath}`);
});
