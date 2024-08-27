const { spawn } = require('child_process');
const { MONGOURI } = require('../src/config/server-config');

const pythonProcess = spawn('python', ['search.py', MONGOURI]);
pythonProcess.stdin.setDefaultEncoding('utf-8');
pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
});
pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
    } else {
        console.log('Python process completed successfully');
    }
});

pythonProcess.on('error', (err) => {
    console.error('Error occurred while spawning Python process:', err);
});
console.log("Python process started");

module.exports = pythonProcess;