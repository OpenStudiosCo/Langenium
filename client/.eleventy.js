import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import pugPlugin from "@11ty/eleventy-plugin-pug";
import pugStylus from "pug-stylus";

const __dirname = dirname( fileURLToPath( import.meta.url ) );

/**
 * Stable per deploy so browsers refetch /assets/game_client.css and /main.js
 * after a publish. Prefer the git short hash; fall back to package version.
 */
function getAssetVersion() {
  try {
    return execSync( 'git rev-parse --short HEAD', {
      cwd: resolve( __dirname, '..' ),
      encoding: 'utf8',
      stdio: [ 'ignore', 'pipe', 'ignore' ],
    } ).trim();
  }
  catch ( error ) {
    try {
      const pkg = JSON.parse( readFileSync( resolve( __dirname, 'package.json' ), 'utf8' ) );
      return String( pkg.version || Date.now() );
    }
    catch ( packageError ) {
      return String( Date.now() );
    }
  }
}

export default function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/vendor": "vendor"});
  eleventyConfig.addPassthroughCopy("CNAME");

  eleventyConfig.addGlobalData( 'assetVersion', getAssetVersion );

  eleventyConfig.addPlugin( pugPlugin, {
    filters: {
      stylus: pugStylus()
    }
  } );

  eleventyConfig.addWatchTarget("./src/**/*");
  eleventyConfig.setServerOptions({
    https: {
      key: "./etc/ssl-cert-snakeoil.key",
      cert: "./etc/ssl-cert-snakeoil.pem",
    }
  });

};

export const config = {
  dir: {
    input:    'src/web',
    layouts:  '../templates',
    output:   '../docs'
  }
};
