
/**
 * Module dependencies.
 */

var express = require('express');


//var http = require('http');
var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');


//var routes = require('./routes');
//var user = require('./routes/user');
//var submit = require('./routes/submit');

var points = require('./points')

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

//app.get('/', routes.index);
/*
app.get('/', function(req, res){
  res.render('index.html');
};

app.get('/view')
*/
//app.get('/users', user.list);
//app.post('/submit', submit.point);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.get('/download', function(req, res){
    res.send(points);

})

io.sockets.on('connection', function (socket) {
  console.log('someone connected')
  points.getTree(socket);

  socket.on('reset', function(data){
    points.reset()
    socket.emit('reset_all', {})
    socket.broadcast.emit('reset_all', {})

  })

 	socket.on('new_point', function (data) {
    points.new_point(socket, data);
  });
})


