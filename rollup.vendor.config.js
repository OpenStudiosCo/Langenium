import uglify from 'rollup-plugin-uglify';

export default {
  moduleName: 'vendor',
  context: 'window',
  entry: 'src/vendor.js',
  dest: 'dist/vendor.js'
};
