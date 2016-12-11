import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

export default {
  moduleName: 'L',
  entry: 'src/L.js',
  plugins: [
    buble(),
    uglify()
  ],
  dest: 'dist/L.js'
};
