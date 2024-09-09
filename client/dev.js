// Simple build script for development.
const chokidar = require('chokidar');
const spawn = require('cross-spawn');

function run (script) {
  spawn('npm', ['run', script], { stdio: 'inherit' });
}

run('dev:11ty');
run('dev:stylus');
run('build:esbuild');

chokidar.watch(['src', '../game'], { }).on('all', (event, path) => {
  if (event === 'change') {
    console.log(event, path);
    if (path.endsWith('.js') || path.endsWith('.ts')) {
        run('build:esbuild');
    }
  }
});

// // Load the server application
// require('child_process').fork('./src/server/server.js');
