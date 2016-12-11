import uglify from 'rollup-plugin-uglify';

export default {
  context: 'window',
  plugins: [ uglify() ],
  entry: 'src/vendor.js',
  dest: 'dist/vendor.js'
};
