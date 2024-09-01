//build.js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import esbuild from 'esbuild';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const context = await esbuild
    .context( {
        entryPoints: [ './src/app/main.js' ],
        bundle: true,
        minify: false,
        outdir: '../docs',
        target: 'es2018',
        alias: {
            '@': resolve( __dirname, 'src/app' ),
            '#': resolve( __dirname, '..' ),
        },
    } );

// Manually do an incremental build
const result = await context.rebuild()

// Enable watch mode
await context.watch()

// // Enable serve mode
// await context.serve()

// // Dispose of the context
// context.dispose()
