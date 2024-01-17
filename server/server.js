/**
 * Langenium Server
 * 
 * 
 * @credit https://medium.com/kocfinanstech/socket-io-with-node-js-express-5cc75aa67cae
 */

const fs = require('fs');

const options = {
  key: fs.readFileSync('../client/etc/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('../client/etc/ssl-cert-snakeoil.pem')
};

const app = require('express')();
const httpServer = require('https').createServer(options, app);
const { Server } = require("socket.io");

const io = new Server(httpServer, {
  cors: {
    // @todo replace with proper approved domain names
    origin: '*'
  }
});
const port = process.env.PORT || 8090;

app.get('/', function (req, res) {
  res.send('<h1>Nothing to see here folks!</h1>');
});

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
})

httpServer.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
