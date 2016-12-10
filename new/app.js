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

var filesToWrite = [
  {
    name: 'index.html',
    content: pug.compile(html, { filename: html, pretty: true })()
  },
  {
    name: 'styles.css',
    content: stylus(styl).use(jeet()).render()
  }
];

writeFiles(filesToWrite);

function writeFiles (files) {
  files.forEach(function(file) {
    writeFile(file.name, file.content);
  });
}

function writeFile (fileName, fileContents) {
  fs.writeFile(fileName, fileContents, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log('Wrote ' + fileName);
  });
}