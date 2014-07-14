
/**
 * Module dependencies.
 */

var express = require('express');

//var http = require('http');
var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('./sockets').listen(server) //this is where sockets.js comes in
//var _ = require('lodash');

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');

/*

var uristring = 
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/test';


var mongoose = require('mongoose');
mongoose.connect(uristring);

var db = mongoose.connection;
*/

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

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


