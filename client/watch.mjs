//build.js
import esbuild from 'esbuild'

const context = await esbuild
    .context({
        entryPoints: ['./src/app/main.js'],
        bundle: true,
        minify: false,
        outdir: '../docs',
        target: 'es2018'
    });
 
// Manually do an incremental build
const result = await context.rebuild()

// Enable watch mode
await context.watch()

// // Enable serve mode
// await context.serve()

// // Dispose of the context
// context.dispose()
