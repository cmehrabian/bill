
/**
 * Module dependencies.
 */

var express = require('express');

var routes = require('./routes');
var user = require('./routes/user');
var submit = require('./routes/submit');

var http = require('http');
var path = require('path');

var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var app = express()
var server = require('http').createServer(app)
server = server.listen(process.env.port || 3000)

var io = require('socket.io').listen(server);

// all environments
//app.set('port', process.env.PORT || 3000);
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
				parentid:null,
				flavor:'comment',
				text:'hello',
        value:1
		}
	]

io.sockets.on('connection', function (socket) {

 	socket.on('new_gram', function (data) {

      console.log('received new gram!')

      data.gramid = ++lastgramid
      data.value = 0

      grams[data.gramid] = data

      var effect = 1
      var current_id = data.gramid 
      while(current_id != null){

        grams[current_id].value += effect

        socket.emit('update', grams[current_id])
        socket.broadcast.emit('update', grams[current_id])


        var neweffect = 0
        if(grams[current_id].flavor == 'assent' && effect == 1 || grams[current_id].flavor == 'dissent' && effect == -1)
          neweffect = 1
        if(grams[current_id].flavor == 'assent' && effect == -1 || grams[current_id].flavor == 'dissent' && effect == 1)
          neweffect = -1

        effect = neweffect
        current_id = grams[current_id].parentid

      }
      //propogate(data.gramid, 1);


  	});

  	for (var i = 0; i < grams.length; ++i){
      //console.log('gram = ' + gram)
      //console.log(grams[0])
  		socket.emit('update', grams[i])
  	}
  
  	//socket.emit('hello', {hello:'hello'})
});

/*
function propogate(gramid, effect){

  if(gramid == null) return

  grams[gramid].value += effect

  socket.emit('update', grams[gramid])
  socket.broadcast.emit('update', grams[gramid])


  var neweffect = 0
  if(grams[gramid].flavor == 'assent' && effect == 1 || grams[gramid].flavor =='dissent' && effect == -1)
    neweffect = 1
  if(grams[gramid].flavor == 'assent' && effect == -1 || grams[gramid].flavor == 'dissent' && effect == 1)
    neweffect = -1

  propogate(grams[gramid].parentid, neweffect)

}
*/
