import pugPlugin from "@11ty/eleventy-plugin-pug";
import pugStylus from "pug-stylus";

export default function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/vendor": "vendor"});
  eleventyConfig.addPassthroughCopy("CNAME");

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
