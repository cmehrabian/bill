
/**
 * Module dependencies.
 */

var express = require('express');


//var http = require('http');
var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

var routes = require('./routes');
var user = require('./routes/user');
var submit = require('./routes/submit');


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
/*
var grams = [ 
{ username: 'tyler',
    parent_id: null,
    flavor: 'comment',
    text: 'hello',
    children: [ 1, 2 ],
    links: [],
    gram_id: 0,
    value: 3 },
  { username: 'tyler',
    parent_id: 0,
    flavor: 'assent',
    text: 'yes',
    children: [],
    links: [ ],
    gram_id: 1,
    value: 1,
    shadow: 1 },
  { username: 'tyler',
    parent_id: 0,
    flavor: 'assent',
    text: 'yep',
    children: [],
    links: [ ],
    gram_id: 2,
    value: 1,
    shadow: 1 } ]
*/

io.sockets.on('connection', function (socket) {
  //console.log('someone connected')

  for (var i = 0; i < grams.length; ++i){
    //console.log('gram = ' + gram)
    //console.log(grams[0])
    socket.emit('update', grams[i])
  }
  socket.emit('update_finished')



  socket.on('reset', function(data){
    grams = []
    lastgram_id = -1
    //socket.emit('update', grams[0])
    socket.emit('reset_all', {})
    socket.broadcast.emit('reset_all', {})

  })

 	socket.on('new_gram', function (data) {

      data.gram_id = ++lastgram_id


      if(data.parent_id == data.gram_id ||
       (data.parent_id != null && grams[data.parent_id] === undefined)){
        console.log("client-side error")
        return
      }

      if(data.flavor == 'link')
        data.parent_id = null


      if(data.parent_id != null)
      { 
        //console.log('gramdump')
        //console.log(grams)
        //console.log(data)
        grams[data.parent_id].children.push(data.gram_id)
      }

      if(data.flavor =='quote')
        data.value = 0
      else
        data.value = 1
      


      grams[data.gram_id] = data

      socket.emit('update',grams[data.gram_id]);
      socket.broadcast.emit('update', grams[data.gram_id])

      if(data.flavor == 'link'){
        addLink(data.gram_id, socket)
      }
      else{

        a = []
        //var current_id = data.gram_id 
        if(data.flavor == 'assent'){
          propogate(data.parent_id, 1, a, socket)
        }
        if(data.flavor == 'dissent'){
          propogate(data.parent_id, -1, a, socket)
        }

      }
        socket.emit('update_finished');
        socket.broadcast.emit('update_finished');


  	});

  	//socket.emit('hello', {hello:'hello'})
});


function propogate(current_id, delta, a, socket, CommonParent){
  if(current_id == null || current_id == CommonParent || delta == 0 ||  a[current_id] !== undefined) 
    return a

  var newdelta = 0


  if(grams[current_id].flavor == 'quote'){
    newdelta = delta
  }
  else{

    //newdelta = grams[current_id].value + delta


    //if they are the same sign.
    if (Math.abs(grams[current_id].value + delta) == Math.abs(grams[current_id].value) + Math.abs(delta)){
      if (delta > 0)
        newdelta = delta;
      if (delta < 0)
        newdelta = 0
    }
    else {
      //if the change will result in passing over 0
      if(Math.abs(delta) > Math.abs(grams[current_id].value)){
        if(grams[current_id].value > 0)
          newdelta = grams[current_id].value
        else 
          newdelta = grams[current_id].value + delta
      }
      else{
        newdelta = delta
      }

    }
    
  }

  grams[current_id].value += delta


  
  if(grams[current_id].flavor == 'dissent')
    newdelta = - newdelta

  //console.log(grams[current_id])
  socket.emit('update',grams[current_id]);
  socket.broadcast.emit('update', grams[current_id]);

  //current_id = grams[current_id].parent_id
  a[current_id] = current_id;


  if(grams[current_id].flavor != 'link'){
    //b = a
    //grams[current_id].shadow += delta
    for(var i = 0; i < grams[current_id].links.length; ++i){
      a = chaseLink(grams[current_id].links[i], delta, a, socket)
    }

  }

  return propogate(grams[current_id].parent_id, newdelta, a, socket, CommonParent)

}

function addLink(link_id, socket){
  //console.log("=======addLink called!")
  //console.log(link_id)
  grams[grams[link_id].links[0]].links.push(link_id)
  grams[grams[link_id].links[1]].links.push(link_id)

  if(hasCycle(grams[link_id].links[0], link_id, link_id) || hasCycle(grams[link_id].links[1], link_id, link_id)){
    console.log("cycle found!")

    var most_recent, least_recent;

    if(grams[link_id].links[0].gram_id > grams[link_id].links[1].gram_id){
      most_recent = grams[link_id].links[0]
      least_recent = grams[link_id].links[1]
    }
    else{
      least_recent = grams[link_id].links[0]
      most_recent = grams[link_id].links[1]
    }

    grams[most_recent].origin_id = grams[most_recent].parent_id
    grams[most_recent].parent_id = grams[least_recent].parent_id


  }

  grams[link_id].CommonParent = findCommonParent(grams[link_id].links[0], grams[link_id].links[1])

  syncLinks(link_id, socket);

}

function syncLinks(link_id, socket){
  var total = grams[grams[link_id].links[0]].value + grams[grams[link_id].links[1]].value
  grams[grams[link_id].links[0]].shadow = grams[grams[link_id].links[0]].value
  grams[grams[link_id].links[1]].shadow = grams[grams[link_id].links[1]].value

  console.log("total = ", total)
  //grams[grams[link_id].links[0]].value = grams[grams[link_id].links[1]].value = total


  //var parent = grams[grams[link_id].links[0]].parent_id
  var delta1 = grams[grams[link_id].links[1]].value
  var delta2 = grams[grams[link_id].links[0]].value


  a = []
  a[link_id] = link_id
  a = propogate(grams[link_id].links[0], delta1, a, socket, grams[link_id].CommonParent)

  //var parent = grams[grams[link_id].links[1]].parent_id

  propogate(grams[link_id].links[1], delta2, a, socket, grams[link_id].CommonParent) 

}

function chaseLink(link_id, delta, a, socket){
  if(a[link_id] !== undefined)
    return a

  a[link_id] = link_id
  a = propogate(grams[link_id].links[1], delta, a, socket)
  return propogate(grams[link_id].links[0], delta, a, socket)

}

//returns the common parent node or null if it doesn't exist.  
function findCommonParent(first_id, second_id){
  a = []
  findCommonParentHelper(first_id, a)
  return findCommonParentHelper(second_id, a)
}

function findCommonParentHelper(gram_id, a){

  if(gram_id == null || a[gram_id] !== undefined) 
    return gram_id

  a[gram_id] = gram_id
  return findCommonParentHelper(grams[gram_id].parent_id, a)
}

function hasCycle(current_id, last_id, link_id){
  if(current_id == link_id)
    return true
  if(current_id == null)
    return false

  for(var i = 0; i < grams[current_id].links.length; ++i){
    if(grams[current_id].links[i] != last_id)
      if(hasCycle(grams[current_id].links[i], current_id, link_id))
        return true
  }

  return hasCycle(grams[current_id].parent_id, current_id, link_id)
}
