
var socketio = require('socket.io');
var rhombus = require('./rhombus');

// All the method calls themselves are defined in rhombus.js and are called with
// a callback in which the socket response is emitted.  This is to make the code 
// cleaner if a request has to make an asynchronous database query.  

module.exports.listen = function(app){
  io = socketio.listen(app);

  var num_watchers = 0;

  io.sockets.on('connection', function (socket) {
    if(num_watchers == 0){
      rhombus.init(function(){
        console.log('initialized');
      })
    }

    ++num_watchers;

    //a request is sent with a point id.
    socket.on('request', function(data){
      var request_id = parseInt(data.point_id);
      if(!isNaN(request_id)){
        rhombus.request(request_id, function(requested){
          socket.emit('update', requested);
        });
      }
      else{
        console.log('user requested ' + data.point_id + ' which is not a number');
      }
 
    })

    socket.on('disconnect', function (data) {
      console.log('client disconnected');

      --num_watchers;
      if(num_watchers == 0){
        rhombus.cleanup(function(){
          console.log('cleaned up');
        });
      }

    });
  });
}