/**
 * Push dist-itch/ to itch.io with Butler.
 *
 * Requires ITCH_TARGET (user/game), e.g. openstudios/langenium.
 * Optional: client/.env.itch with ITCH_TARGET=...
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const clientDir = resolve( __dirname, '..' );
const repoRoot = resolve( clientDir, '..' );
const distDir = resolve( repoRoot, 'dist-itch' );
const packageJsonPath = resolve( clientDir, 'package.json' );
const envItchPath = resolve( clientDir, '.env.itch' );

const CHANNEL = 'html5';

function fail( message ) {
    console.error( `deploy-itch: ${ message }` );
    process.exit( 1 );
}

function loadEnvItch() {
    if ( ! existsSync( envItchPath ) ) {
        return;
    }

    const lines = readFileSync( envItchPath, 'utf8' ).split( /\r?\n/ );

    for ( const line of lines ) {
        const trimmed = line.trim();

        if ( ! trimmed || trimmed.startsWith( '#' ) ) {
            continue;
        }

        const eq = trimmed.indexOf( '=' );

        if ( eq <= 0 ) {
            continue;
        }

        const key = trimmed.slice( 0, eq ).trim();
        let value = trimmed.slice( eq + 1 ).trim();

        if (
            ( value.startsWith( '"' ) && value.endsWith( '"' ) ) ||
            ( value.startsWith( "'" ) && value.endsWith( "'" ) )
        ) {
            value = value.slice( 1, -1 );
        }

        if ( process.env[ key ] === undefined ) {
            process.env[ key ] = value;
        }
    }
}

function butlerMissingHint() {
    return [
        'butler was not found on PATH.',
        'Install it from https://itch.io/docs/butler/installing',
        'Linux (stable): curl -L -o butler.zip https://broth.itch.zone/butler/linux-amd64/LATEST/archive/default && unzip butler.zip && chmod +x butler && sudo mv butler /usr/local/bin/',
        'Then run: butler login',
    ].join( '\n' );
}

function main() {
    loadEnvItch();

    const target = ( process.env.ITCH_TARGET || '' ).trim();

    if ( ! target || ! target.includes( '/' ) ) {
        fail(
            'ITCH_TARGET is required (format user/game). Export it or put ITCH_TARGET=user/game in client/.env.itch'
        );
    }

    if ( ! existsSync( distDir ) || ! existsSync( resolve( distDir, 'index.html' ) ) ) {
        fail( 'dist-itch/ is missing. Run npm run package:itch first.' );
    }

    const pkg = JSON.parse( readFileSync( packageJsonPath, 'utf8' ) );
    const userVersion = String( pkg.version || '0.0.0' );
    const channelTarget = `${ target }:${ CHANNEL }`;

    const versionCheck = spawnSync( 'butler', [ 'version' ], { encoding: 'utf8' } );

    if ( versionCheck.error && versionCheck.error.code === 'ENOENT' ) {
        fail( butlerMissingHint() );
    }

    if ( versionCheck.status !== 0 ) {
        fail( `butler version failed:\n${ versionCheck.stderr || versionCheck.stdout }` );
    }

    console.log( `deploy-itch: pushing ${ distDir } → ${ channelTarget } (${ userVersion })` );

    const push = spawnSync(
        'butler',
        [ 'push', distDir, channelTarget, '--userversion', userVersion ],
        {
            encoding: 'utf8',
            stdio: 'inherit',
        }
    );

    if ( push.error && push.error.code === 'ENOENT' ) {
        fail( butlerMissingHint() );
    }

    if ( push.status !== 0 ) {
        fail( `butler push failed with exit code ${ push.status }` );
    }

    console.log( 'deploy-itch: done' );
}

main();
