
angular.module('rhombus', ['components', 'ngRoute'])

.config(function($routeProvider){
	$routeProvider
		.when('/', {
			controller:'discussionCtrl',
			templateUrl:'views/discussions.html'
		})
		.when('/view/:node', {
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

.controller('graphCtrl', function($scope, $rootScope, graph, $routeParams){
	$rootScope.selected = undefined

	$scope.username = ''
	$scope.parent_point_id = null
	//$scope.point_point_id = lastpoint_point_id + 1;
	$scope.flavor = 'comment'
	$scope.text = ''
	$scope.links = []
	//$scope.value = 0

	//$scope.flavors = ['comment', 'assent', 'dissent', 'quote', 'link']
	$scope.flavors = ['comment', 'assent', 'dissent', 'quote']

	socket = io.connect(document.URL);


	socket.emit('request', {
		point_id:$routeParams.node
	})


  	socket.on('update', function (data) {

		var points = _.pluck(graph.nodes, 'data')

		_.forEach(data, function(n){
			var elem = _.find(points, {point_id:n.point_id})
			if(elem === undefined){
				graph.newNode(data)
				if(parent !== undefined){
					graph.newEdge(n.point_id, n.parent)
				}
			}
			else{
				elem = data
			}
		})

		// ??? ? $scope.$digest() 

	});


	$scope.submit = function(){

		var n = {
			username:$scope.username,
			value:0,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:$rootScope.selected.point_id,
			children:[],
			links:[],
			original:false
		}

		//graph.newNode(n)

/*
		var points = _.pluck(graph.nodes, 'data')
		var parent = _.find(points, $rootScope.selected)

		if(parent !== undefined){
			parent.children.push(n.index)
			n.parent = parent.point_id
			graph.newEdge(n, n.parent)
		}
*/
		$scope.flavor = 'comment'
		$scope.text = ''


		socket.emit('new_node', n)
		
	}

	$scope.reset = function(){
		socket.emit('reset', {});
		//graph = new Springy.Graph()
  		//drawGraph()
	}

	var addOriginEdge = function(point_point_id, origin_point_id){
		var edges = graph.getEdges(nodes[point_point_id], nodes[origin_point_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		edges = graph.getEdges(nodes[point_point_id], nodes[$rootScope.points[point_point_id].parent_point_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		graph.newEdge(nodes[point_point_id], nodes[origin_point_id], {color: '#FF0011'})
		graph.newEdge(nodes[point_point_id], nodes[$rootScope.points[point_point_id].parent_point_id], {color: '#000000'})

		$rootScope.points[$rootScope.points[point_point_id].parent_point_id].children.push(point_point_id)
		//need to remove child from origin??
	}

})

.controller('discussionCtrl', function($scope){

	$scope.discussions = []
	socket = io.connect(document.URL);

	socket.emit('request_discussions', {})

	socket.on('respond_discussions', function(data){
		$scope.discussions = data
		$scope.$digest()
	})

})

.controller('newCtrl', function($scope){
	$scope.username = ''
	$scope.text = ''

	socket = io.connect(document.URL);

	$scope.submit = function(){
		
		socket.emit('new_node', {
			username:$scope.username,
			value:1,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:undefined,
			children:[],
			links:[], 
			original:true,
		})

	}


})