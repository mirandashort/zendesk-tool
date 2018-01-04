var socket = connect('http://localhost:3000');
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form');

uploader.on('start', function(fileInfo) {
  console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
  console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
  console.log('Upload Complete', fileInfo);
});
uploader.on('error', function(err) {
  console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
  console.log('Aborted: ', fileInfo);
});


form.onsubmit = function(ev) {
  ev.preventDefault();

  // send file element to upload
  var fileEl = document.getElementById('file');
  // or just pass it directly as an object
  var uploadIds = uploader.upload(fileEl.files);

};
