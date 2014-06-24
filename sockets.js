
var socketio = require('socket.io')
var points = require('./points')


module.exports.listen = function(app){
  io = socketio.listen(app)

  var num_watchers = 0

  io.sockets.on('connection', function (socket) {
    if(num_watchers == 0){
      points.init(function(){
        console.log('initialized')
      })
    }

    num_watchers++


    socket.on('request_discussions', function(data){
      points.getOriginals(function(list){
        socket.emit('update_discussions', list)
      })
    })

    socket.on('request', function(data){
      var request_id = parseInt(data.point_id)
      if(!isNaN(request_id)){
        points.request(request_id, function(requested){
          socket.emit('update', requested)

        })
      }
      else{
        console.log('user requested ' + data.point_id + ' which is not a number')
      }
 
    })

    socket.on('new_point', function (data) {
      points.new_point(data, function(modified){
        socket.emit('update', modified)
        socket.broadcast.emit('update', modified)
      })
      
    });

    socket.on('disconnect', function (data) {
      console.log('client disconnected')

      --num_watchers

      if(num_watchers == 0){
        points.cleanup(function(){
          console.log('cleaned up')
        })
      }

    })


  })


}