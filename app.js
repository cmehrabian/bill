
/**
 * Module dependencies.
 */

var express = require('express');

//var http = require('http');
var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var _ = require('lodash');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');



var originals = []

var points = require('./points')


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  var nodeSchema = mongoose.Schema({
      username:String,
      value:Number,
      time:Number,
      flavor:String,
      text:String,
      parent:Number,
      children:Array,
      links:Array, 
      original:Boolean

  })

  var lastidSchema = mongoose.Schema({
    lastpoint_id: Number
  })

  var mNode = mongoose.model('mNode', nodeSchema)
  var mid = mongoose.model('mlastpoint_id', lastidSchema)

  var originalids = []


  mNode.find({original:true}, function(err, o){
    if (err) return console.error(err);
    originals = o
  })

  


  mid.find(function (err, point_id){
    if (err) return console.error(err);
    console.log(point_id)
    console.log(point_id.length)
    if(point_id.length != 0 && point_id[0].point_id !== NaN)
      points.setLastId(point_id[0].point_id)
  })

  mid.remove(function (err) {
    if (err) return console.error(err);
  });

  var num_watchers = 0

  io.sockets.on('connection', function (socket) {

    num_watchers++

    socket.on('request_discussions', function(data){
      socket.emit('respond_discussions', originals)
    })

    socket.on('request', function(data){
            console.log('requested:' + data.point_id)

      var a = points.getTree(data.point_id)
      console.log('cached response')
      console.log(a)
      if(a.length == 0){
        a = query_recur(data.point_id, a)
      }
      console.log('responding with:')
      console.log(a)
      socket.emit('update', a)
    })

    socket.on('new_node', function (data) {
      if(data.original){
        console.log('original thing received:')
        console.log(data)
        originals.push(data)
      }

      points.new_node(socket, data);

    });

    socket.on('disconnect', function (data) {
      console.log('client disconnected')
      a = points.removeRefs(socket)

      --num_watchers

      if(num_watchers == 0){
        var lastpoint_id = new mid({
          point_id:points.getLastId()
        })

        console.log(lastpoint_id)

        lastpoint_id.save(function(err, lastpoint_id){
          if (err) return console.err(err)
        })
      }

      _.forEach(a, function(point){
        var p = new mNode({ 
          username:point.username,
          value:point.value,
          time:point.time,
          flavor:point.flavor,
          text:point.text,
          parent:point.parent,
          children:point.children,
          links:point.links, 
          original:point.original,
        })
        p.save(function(err, p){
          if (err) return console.error(err)
        })
      })

    })
  })


  var query_recur = function(point_id, a){
    if(point_id === undefined || _.find(a, {point_id:point_id}) !== undefined)
      return

    mNode.find({point_id:point_id}, function(err, o){
      if (err) return console.error(err);
      console.log('database lookup for id ' + point_id + ' found:')
      console.log(o)
      a.push(o)
      found = o
      _.forEach(found.children, function(child){
        query_recur(child, a)
      })

      query_recur(found.parent, a)

    })
    //console.log('query_recur so far:')
    //console.log(a)
  }


});



// all environments


app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//=======
//app.set('env', 'production')
//=======

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


