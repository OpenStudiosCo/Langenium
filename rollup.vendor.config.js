import uglify from 'rollup-plugin-uglify';

export default {
  context: 'window',
  format: 'iife',
  //plugins: [ uglify() ],
  entry: 'src/vendor.js',
  dest: 'dist/vendor.js'
};
