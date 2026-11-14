/**
 * Build a self-contained itch.io HTML5 package from docs/.
 *
 * Same approach as the previous manual tmp/ bundle: copy the client build,
 * rewrite root-absolute and host asset URLs to paths relative to each file,
 * and refuse to ship secrets or host-only bind files.
 *
 * Matomo and other public client scripts are left intact.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const repoRoot = resolve( __dirname, '../..' );
const docsDir = resolve( repoRoot, 'docs' );
const outDir = resolve( repoRoot, 'dist-itch' );

const TEXT_EXTENSIONS = new Set( [
    '.css',
    '.html',
    '.js',
    '.json',
    '.svg',
    '.webmanifest',
    '.xml',
] );

const REMOVE_NAMES = new Set( [
    'CNAME',
    '.env',
    '.env.itch',
    'butler_creds',
] );

const REMOVE_EXTENSIONS = new Set( [
    '.env',
    '.key',
    '.pem',
] );

const SECRET_PATTERNS = [
    /\.env(?:\.|$)/i,
    /butler_creds/i,
    /BEGIN (?:RSA )?PRIVATE KEY/,
    /BUTLER_API_KEY/,
    /ITCH_API/,
];

function fail( message ) {
    console.error( `package-itch: ${ message }` );
    process.exit( 1 );
}

function walkFiles( dir ) {
    const results = [];

    for ( const entry of readdirSync( dir, { withFileTypes: true } ) ) {
        const fullPath = join( dir, entry.name );

        if ( entry.isDirectory() ) {
            results.push( ...walkFiles( fullPath ) );
            continue;
        }

        if ( entry.isFile() ) {
            results.push( fullPath );
        }
    }

    return results;
}

function extensionOf( filePath ) {
    const base = filePath.split( '/' ).pop() || '';
    const dot = base.lastIndexOf( '.' );

    if ( dot <= 0 ) {
        return '';
    }

    return base.slice( dot ).toLowerCase();
}

function shouldRemove( filePath ) {
    const base = filePath.split( '/' ).pop() || '';
    const ext = extensionOf( filePath );

    if ( REMOVE_NAMES.has( base ) ) {
        return true;
    }

    if ( REMOVE_EXTENSIONS.has( ext ) ) {
        return true;
    }

    if ( base.startsWith( '.env' ) ) {
        return true;
    }

    return false;
}

/**
 * Turn a site-root path (/assets/...) into a path relative to the file being rewritten.
 */
function relativeFromFile( filePath, rootAbsolutePath ) {
    const normalised = rootAbsolutePath.replace( /^https?:\/\/langenium\.com/, '' );

    if ( ! normalised.startsWith( '/' ) ) {
        return rootAbsolutePath;
    }

    const target = join( outDir, normalised.slice( 1 ) );
    const fromDir = dirname( filePath );
    let rel = relative( fromDir, target ).replace( /\\/g, '/' );

    if ( ! rel.startsWith( '.' ) ) {
        rel = `./${ rel }`;
    }

    return rel;
}

function rewriteRootPath( filePath, match, pathWithQuery ) {
    const [ pathname, query = '' ] = pathWithQuery.split( /(?=\?)/ );
    return relativeFromFile( filePath, pathname ) + query;
}

function rewriteText( filePath, content ) {
    let next = content;

    // Hosted asset URLs → package-relative paths.
    next = next.replace( /https?:\/\/langenium\.com(\/assets\/[^"'`\s)]+)/g, ( full, assetPath ) => {
        return relativeFromFile( filePath, assetPath );
    } );

    // Quoted root-absolute game assets.
    next = next.replace( /(['"])\/((?:assets|vendor)\/[^'"]+)\1/g, ( full, quote, assetPath ) => {
        return quote + rewriteRootPath( filePath, full, '/' + assetPath ) + quote;
    } );
    next = next.replace( /(['"])\/(main\.js[^'"]*)\1/g, ( full, quote, assetPath ) => {
        return quote + rewriteRootPath( filePath, full, '/' + assetPath ) + quote;
    } );

    // CSS url(/assets/...) forms.
    next = next.replace( /url\(\s*(['"]?)\/((?:assets|vendor)\/[^)'"]+)\1\s*\)/g, ( full, quote, assetPath ) => {
        const rewritten = rewriteRootPath( filePath, full, '/' + assetPath );
        return `url(${ quote }${ rewritten }${ quote })`;
    } );

    // Unquoted HTML attributes.
    next = next.replace( /\b(src|href)=(\/(?:assets|vendor)\/[^>\s]+)/g, ( full, attr, assetPath ) => {
        return `${ attr }=${ rewriteRootPath( filePath, full, assetPath ) }`;
    } );
    next = next.replace( /\b(src|href)=(\/main\.js[^>\s]*)/g, ( full, attr, assetPath ) => {
        return `${ attr }=${ rewriteRootPath( filePath, full, assetPath ) }`;
    } );

    // Boot base for subdirectory hosting (same effect as the previous tmp/ bundle).
    next = next.replace(
        /l\.url\s*=\s*['"]\/\/['"]\s*\+\s*location\.host\s*;?/,
        "l.url = '.';"
    );

    return next;
}

function auditSecrets( filePath, content ) {
    for ( const pattern of SECRET_PATTERNS ) {
        if ( pattern.test( filePath ) || pattern.test( content ) ) {
            fail( `refusing to package sensitive content in ${ relative( outDir, filePath ) }` );
        }
    }
}

function auditAbsoluteAssetRefs( filePath, content ) {
    const patterns = [
        /(['"])\/assets\//,
        /(['"])\/vendor\//,
        /(['"])\/main\.js/,
        /url\(\s*['"]?\/assets\//,
        /url\(\s*['"]?\/vendor\//,
        /https?:\/\/langenium\.com\/assets\//,
    ];

    for ( const pattern of patterns ) {
        if ( pattern.test( content ) ) {
            fail(
                `root-absolute or host asset URLs remain in ${ relative( outDir, filePath ) } (${ pattern })`
            );
        }
    }
}

function main() {
    if ( ! existsSync( docsDir ) ) {
        fail( `docs/ not found at ${ docsDir }. Run npm run build from client/ first.` );
    }

    if ( ! existsSync( join( docsDir, 'index.html' ) ) || ! existsSync( join( docsDir, 'main.js' ) ) ) {
        fail( 'docs/ is missing index.html or main.js. Run npm run build from client/ first.' );
    }

    rmSync( outDir, { recursive: true, force: true } );
    mkdirSync( outDir, { recursive: true } );
    cpSync( docsDir, outDir, { recursive: true } );

    const files = walkFiles( outDir );
    let rewritten = 0;
    let removed = 0;

    for ( const filePath of files ) {
        if ( shouldRemove( filePath ) ) {
            rmSync( filePath, { force: true } );
            removed += 1;
            continue;
        }

        const ext = extensionOf( filePath );

        if ( ! TEXT_EXTENSIONS.has( ext ) ) {
            continue;
        }

        const original = readFileSync( filePath, 'utf8' );
        auditSecrets( filePath, original );

        const updated = rewriteText( filePath, original );

        if ( updated !== original ) {
            writeFileSync( filePath, updated );
            rewritten += 1;
        }

        auditSecrets( filePath, updated );
        auditAbsoluteAssetRefs( filePath, updated );
    }

    for ( const filePath of walkFiles( outDir ) ) {
        if ( shouldRemove( filePath ) ) {
            rmSync( filePath, { force: true } );
            removed += 1;
        }
    }

    const sizeBytes = walkFiles( outDir ).reduce( ( total, filePath ) => {
        return total + statSync( filePath ).size;
    }, 0 );

    console.log( `package-itch: wrote ${ outDir }` );
    console.log( `package-itch: rewritten ${ rewritten } text files, removed ${ removed } host-only/secret files` );
    console.log( `package-itch: ${( sizeBytes / ( 1024 * 1024 ) ).toFixed( 1 )} MiB` );
}

main();
