
/**
 * Module dependencies.
 */

var express = require('express');


var http = require('http');
var path = require('path');

var app = module.exports = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var routes = require('./routes');
var user = require('./routes/user');
var submit = require('./routes/submit');


/*
var app = express()

var server = require('http').createServer(app)
var port = 3000
if ('development' == app.get('env')) {
  //server = server.listen(app.get('port'))
  port = process.env.PORT
}

var io = require('socket.io').listen(server);
*/
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


//=======
//app.set('env', 'production')
//=======


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/submit', submit.gram);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



var connections = 0;
var lastgram_id = -1

var grams = []
	/*[
  
		{
			username:'tyler',
			gram_id:'0',
			parent_id:null,
			flavor:'comment',
			text:'hello',
    		value:1
		}

	]*/

io.sockets.on('connection', function (socket) {
  console.log('someone connected')

  socket.on('reset', function(data){
    grams = []
    lastgram_id = -1
    //socket.emit('update', grams[0])
    socket.emit('reset_all', {})
    socket.broadcast.emit('reset_all', {})

  })

 	socket.on('new_gram', function (data) {

      //console.log('received new gram!')
      //console.log(data)



      data.gram_id = ++lastgram_id

      if(data.parent_id == data.gram_id ||
       (data.parent_id != null && grams[data.parent_id] === undefined)){
        console.log("client-side error")
        return
      }

      data.value = 0


      //console.log(data.gram_id)
      grams[data.gram_id] = data
      //console.log(grams[data.gram_id])
      var effect = 1
      var current_id = data.gram_id 
      while(current_id != null){

        grams[current_id].value += effect

        socket.emit('update', grams[current_id])
        socket.broadcast.emit('update', grams[current_id])
        //console.log('sending:')
        //console.log(grams[current_id])

        var neweffect = 0
        if(grams[current_id].flavor == 'assent' && effect == 1 || grams[current_id].flavor == 'dissent' && effect == -1)
          neweffect = 1
        if(grams[current_id].flavor == 'assent' && effect == -1 || grams[current_id].flavor == 'dissent' && effect == 1)
          neweffect = -1

        effect = neweffect
        current_id = grams[current_id].parent_id

      }
      //propogate(data.gram_id, 1);


  	});

  	for (var i = 0; i < grams.length; ++i){
      //console.log('gram = ' + gram)
      //console.log(grams[0])
  		socket.emit('update', grams[i])
  	}
  
  	//socket.emit('hello', {hello:'hello'})
});

/*
function propogate(gram_id, effect){

  if(gram_id == null) return

  grams[gram_id].value += effect

  socket.emit('update', grams[gram_id])
  socket.broadcast.emit('update', grams[gram_id])


  var neweffect = 0
  if(grams[gram_id].flavor == 'assent' && effect == 1 || grams[gram_id].flavor =='dissent' && effect == -1)
    neweffect = 1
  if(grams[gram_id].flavor == 'assent' && effect == -1 || grams[gram_id].flavor == 'dissent' && effect == 1)
    neweffect = -1

  propogate(grams[gram_id].parent_id, neweffect)

}
*/
