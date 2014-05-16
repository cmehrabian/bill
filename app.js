
/**
 * Module dependencies.
 */

var express = require('express');

var routes = require('./routes');
var user = require('./routes/user');
var submit = require('./routes/submit');

var http = require('http');
var path = require('path');


var app = express();

var server = http.createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
//app.listen(3000);

//

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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/submit', submit.gram);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



var connections = 0;
var lastgramid = 0
var grams = 
	[
		{
				username:'tyler',
				gramid:'0',
				parentid:'-1',
				flavor:'comment',
				text:'hello'
		}
	]

io.sockets.on('connection', function (socket) {

 	socket.on('new_gram', function (data) {
    	grams.append(data)
    	socket.emit('gram_id', ++lastgramid)
  	});
/*
  	for (gram in grams){
  		socket.emit('update', gram)
  	}
  */
  	socket.emit('hello', {hello:'hello'})
});

