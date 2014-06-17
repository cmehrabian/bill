
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

.controller('graphCtrl', function($scope, $rootScope, graph, $routeParams, socket){

	graph.init()
	console.log('graph ctrl initialized')

	$scope.$on('$destroy', function(){
		socket.removeAllListeners()
		console.log('destroyed')
	})

	$rootScope.selected = null

	$scope.username = ''
	$scope.parent_point_id = null
	//$scope.point_point_id = lastpoint_point_id + 1;
	$scope.flavor = 'comment'
	$scope.text = ''
	$scope.links = []
	//$scope.value = 0

	//$scope.flavors = ['comment', 'assent', 'dissent', 'quote', 'link']
	$scope.flavors = ['comment', 'assent', 'dissent', 'quote']


	socket.emit('request', {
		point_id:$routeParams.point_id
	})


  	socket.on('update', function (data) {

  		console.log('received update:')
  		console.log(data)
  		graph.update(data, $routeParams.point_id)


		$rootScope.selected = data[0]
		//$scope.$digest()

		console.log('update finished')
		//console.log('points after modification:')
		//console.log(points)
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
			original:false,
			propogated:0
		}

		$scope.flavor = 'comment'
		$scope.text = ''

		if($rootScope.selected == null)
			return

		socket.emit('new_point', n)
		
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