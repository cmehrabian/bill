
/*
rhombus.js and components.js are angular and make up the core of client-side business logic.

This file contains all the controllers.  
*/

/*
graphCtrl is strongly coupled with the graph service.  
graphCtrl is built to be minimalistic, it basically just has 
some event handlers for socket io and graph selectors, and the logic 
for sending new nodes.  All the heavy duty lifting with keeping the 
graph visible is done is the graph service.  
*/

angular.module('rhombus', ['components', 'controllers', 'ngRoute'])

.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl:'views/board.html',
			controller:'boardCtrl'
		})
		.when('/new',{
			templateUrl:'views/new.html',
			controller:'newCtrl'
		})
		.when('/view/:point_id', {
			templateUrl:'views/graph.html',
			controller:'graphCtrl'
		})
})
