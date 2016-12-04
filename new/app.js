/*
  Langenium Node.js Application
*/

var pug = require('pug')
  , path = require('path')
  , fs = require('fs')
  , indexfile = path.join(__dirname + '/index.pug')
  , str = fs.readFileSync(indexfile, 'utf8')
  , fn = pug.compile(str, { filename: indexfile, pretty: true });

fs.writeFile(path.join(__dirname + '/index.html'), fn(), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log('The file was saved!');
});