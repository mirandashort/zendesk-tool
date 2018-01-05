var express = require('express');
var formidable = require('formidable');
var app = express();
var http = require('http');
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
var SocketIOFile = require('socket.io-file');
var dialog = require('dialog');
var moment = require('moment');

app.use(express.static('public'));
app.use(express.static(__dirname + '/index.js'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/form.html');
});

app.post('/', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req);
  form.on('fileBegin', function(name, file) {
    file.path = __dirname + '/' + file.name;
  });
  form.on('file', function(name, file) {
    console.log('Uploaded ' + file.name);
  });

  res.sendFile(__dirname + '/form.html');
  dialog.info('File submitted! It may take a while to see your completed task reflected in Zendesk.',
    function(exitCode) {
      if (exitCode == 0) console.log('User clicked OK');
    });
});

app.get('/client.js', function(req, res) {
  res.sendFile(__dirname + '/client.js');
});
app.get('/socket.io.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
app.get('/socket.io-file-client.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

io.on('connection', function(socket) {
  console.log('Socket connected.');

  var uploader = new SocketIOFile(socket, {
    uploadDir: 'uploads',
    accepts: ['text/csv', 'application/octet-stream'],
    rename: moment().toISOString()
  });

  uploader.on('start', function(fileInfo) {
    console.log('Start uploading');
    console.log(fileInfo);
  });
  uploader.on('stream', function(fileInfo) {
    console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });
  uploader.on('complete', function(fileInfo) {
    console.log('Upload Complete.');
    console.log(fileInfo);
    uploader.emit(fileInfo);
  });
  uploader.on('error', function(err) {
    console.log('Error!', err);
  });
  uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
  });
});

httpServer.listen(3000, function() {
  console.log("Server listening on localhost:3000");
});
