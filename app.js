
/**
 * Module dependencies.
 */

var express = require('express');

var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('./sockets').listen(server) //this is where sockets.js comes in

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');

var rhombus = require('./rhombus')

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

app.get('/reset', function(req, res){
  rhombus.reset()
  res.send('reset')
});

app.get('/requestTopics', function(req, res){
  rhombus.requestTopics(function(topics){res.send(topics)});
});

app.post('/submit', function(req, res, data){
	rhombus.new_point(req.body, function(){res.send('')});
})

app.get('/download', function(req, res){
    rhombus.download(function(points){res.send(points);});
});


