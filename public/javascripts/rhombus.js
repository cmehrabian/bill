
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


angular.module('rhombus', ['components', 'ngRoute'])

.config(function($routeProvider){
	$routeProvider
		.when('/', {
			controller:'discussionCtrl',
			templateUrl:'views/discussions.html'
		})
		.when('/view/:point_id', {
			templateUrl:'views/graph.html',
			controller:'graphCtrl'
		})
		.when('/new',{
			templateUrl:'views/new.html',
			controller:'newCtrl'
		})
		.otherwise({
      		redirectTo:'/'
    	});

})

.controller('graphCtrl', function($scope, graph, $routeParams, socket){

	graph.init()

	$scope.$on('$destroy', function(){
		socket.removeAllListeners()
	})

	$scope.selected = null
	$scope.children = null
	$scope.parent = null

	$scope.username = ''
	$scope.flavor = 'comment'
	$scope.text = ''
	$scope.links = []
	$scope.editing = false
	$scope.looking = true

	//$scope.flavors = ['comment', 'assent', 'dissent', 'quote', 'link']
	$scope.flavors = ['comment', 'assent', 'dissent', 'quote']

	var updateSelected = function(selected, children, parent){
		$scope.selected = selected
		$scope.children = children
		$scope.parent = parent
		$scope.looking = true
		if(!$scope.$$phase) {
			$scope.$digest()
		}	
	}

	graph.registerSelectionChange(updateSelected)

	$scope.select = function(node){
		if(node == null || node === undefined)
			return
		graph.select(node)
	}

	$scope.close = function(){
		$scope.looking = false
	}

	$scope.cancel = function(){
		$scope.editing = false
	}



	socket.emit('request', {
		point_id:$routeParams.point_id
	})


  	socket.on('update', function (data) {


  		graph.update(data, $routeParams.point_id)

		//$scope.$digest()
	});

  	$scope.reset = function(){
  		console.log($scope.selected)
  	}



	$scope.submit = function(){

		if($scope.selected == null)
			return


		var n = {
			username:$scope.username,
			value:0,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:$scope.selected.data.point_id,
			children:[],
			links:[],
			original:false,
			propogated:0
		}

		$scope.flavor = 'comment'
		$scope.text = ''


		socket.emit('new_point', n)

		$scope.editing = false
		
	}

})

.controller('discussionCtrl', function($scope, socket){

	$scope.$on('$destroy', function(){
		socket.removeAllListeners()
	})

	$scope.discussions = []

	socket.emit('request_discussions', {})

	socket.on('update_discussions', function(data){
		$scope.discussions = data
	})

})

.controller('newCtrl', function($scope, socket){
	$scope.username = ''
	$scope.text = ''

	socket = io.connect(document.URL);

	$scope.submit = function(){
		
		socket.emit('new_point', {
			username:$scope.username,
			value:0,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:null,
			children:[],
			links:[], 
			original:true,
			flavor:'comment',
			propogated:0
		})

	}



})