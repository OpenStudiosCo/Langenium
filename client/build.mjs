//build.js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import esbuild from 'esbuild';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

esbuild
    .build( {
        entryPoints: [ './src/app/main.js' ],
        bundle: true,
        minify: true,
        outdir: '../docs',
        target: 'es2018',
        alias: {
            '@': resolve( __dirname, 'src/app' ),
            '#': resolve( __dirname, '..' ),
        },
    } )
    .catch( () => process.exit( 1 ) )
