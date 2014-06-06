
angular.module('rhombus', ['components', 'ngRoute'])

.config(function($routeProvider){
	$routeProvider
		.when('/', {
			controller:'conversationCtrl',
			templateUrl:'views/conversations.html'
		})
		.when('/view', {
			templateUrl:'views/graph.html',
			controller:'graphCtrl'
		})
		.otherwise({
      		redirectTo:'/'
    	});

})

.controller('graphCtrl', function($scope, $rootScope, $http, graph){
	$rootScope.selected = null

	$scope.username = ''
	$scope.parent_id = null
	//$scope.point_id = lastpoint_id + 1;
	$scope.flavor = 'comment'
	$scope.text = ''
	$scope.children = []
	$scope.links = []
	//$scope.value = 0


	$rootScope.points = []

	//$scope.flavors = ['comment', 'assent', 'dissent', 'quote', 'link']
	$scope.flavors = ['comment', 'assent', 'dissent', 'quote']

	var socket = io.connect(document.URL);

  	socket.on('update', function (data) {
  		
  		if($rootScope.points[data.point_id] === undefined)
  			$rootScope.points[data.point_id] = graph.addNode(data)
  		else
  			$rootScope.points[data.point_id].data = data

  		$rootScope.selected = data.point_id
/*
  		if(data.origin_id !== undefined){
  			console.log(data.origin_id)
  			//springyServ.addOriginEdge(data.point_id, data.origin_id)
  		}
    	//$scope.$digest()
    	*/
	});

	socket.on('update_finished', function(data){
		$scope.$digest()
	})


  	socket.on('reset_all', function(data) {
  		$rootScope.points = []
  		nodes = []
  		$rootScope.selected = null

		$scope.username = ''
		$scope.parent_id = null
		$scope.flavor = ''
		$scope.text = ''

  		$scope.$digest()
  		//graph = new Springy.Graph()
  		//drawGraph()  FIXME
  	})

	$scope.submit = function(){
		socket.emit('new_point', {
			username:$scope.username,
			parent_id:$rootScope.selected,
			flavor:$scope.flavor,
			text:$scope.text,
			children:[],
			links:$scope.links
		})
		//$scope.parent_id = -1
		$scope.flavor = 'comment'
		$scope.text = ''
		$scope.links = []

	}

	$scope.reset = function(){
		socket.emit('reset', {});
		//graph = new Springy.Graph()
  		//drawGraph()
	}



	var addOriginEdge = function(point_id, origin_id){
		var edges = graph.getEdges(nodes[point_id], nodes[origin_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		edges = graph.getEdges(nodes[point_id], nodes[$rootScope.points[point_id].parent_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		graph.newEdge(nodes[point_id], nodes[origin_id], {color: '#FF0011'})
		graph.newEdge(nodes[point_id], nodes[$rootScope.points[point_id].parent_id], {color: '#000000'})

		$rootScope.points[$rootScope.points[point_id].parent_id].children.push(point_id)
		//need to remove child from origin??
	}

})

.controller('conversationCtrl', function(){

})