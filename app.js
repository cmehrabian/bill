
/**
 * Module dependencies.
 */

var express = require('express');

//var http = require('http');
var path = require('path');

var app = module.exports = express()
var server = require('http').createServer(app)
var io = require('./sockets').listen(server) //important
//var _ = require('lodash');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

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


