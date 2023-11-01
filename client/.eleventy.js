module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/vendor": "vendor"});
  eleventyConfig.addPassthroughCopy("CNAME");

  eleventyConfig.addWatchTarget("./src/**/*");
  eleventyConfig.setServerOptions({
    https: {
      key: "./etc/ssl-cert-snakeoil.key",
      cert: "./etc/ssl-cert-snakeoil.pem",
    }
  });

  return {
    dir: {
      input:    'src/web',
      layouts:  'src/templates',
      output:   'docs'
    },
  };
};
