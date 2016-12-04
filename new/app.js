/*
  Langenium Node.js Application
*/

var pug = require('pug')
  , path = require('path')
  , fs = require('fs')
  , stylus = require('stylus')
  , jeet = require('jeet')
  , html = fs.readFileSync('index.pug', 'utf8')
  , styl = fs.readFileSync('styles.styl', 'utf8');

writeFile('index.html', pug.compile(html, { filename: html, pretty: true })());
writeFile('styles.css', stylus(styl).use(jeet()).render());

function writeFile (fileName, fileContents) {
  fs.writeFile(fileName, fileContents, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log('The file ' + fileName + ' was saved!');
  });
}