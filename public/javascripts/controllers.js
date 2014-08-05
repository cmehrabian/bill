angular.module('controllers', [])
.controller('graphCtrl', function($scope, graph, $routeParams, socket, $http){

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
			ghostvalue:0,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:$scope.selected.data.point_id,
			children:[],
			links:[],
			linkhelpers:[],
			original:false,
			propagated:0
		}

		$scope.flavor = 'comment'
		$scope.text = ''

		// we don't really care about the response.
		$http({method: 'POST', url: '/submit', data: n})

		$scope.editing = false
	}
})

.controller('newCtrl', function($scope, $location, $http){
	$scope.username = ''
	$scope.text = ''


	$scope.submit = function(){
		var data =  
		{
			username:$scope.username,
			value:0,
			ghostvalue:0,
			time:_.now(),
			flavor:$scope.flavor,
			text:$scope.text,
			parent:null,
			children:[],
			links:[], 
			linkhelpers:[],
			original:true,
			flavor:'comment',
			propagated:0
		}

		$http({method: 'POST', url: '/submit', data: data}).
		    success(function(data, status, headers, config) {
		    	$location.path('/');
		    }).
		    error(function(data, status, headers, config) {
		    	console.log(data);
		    	console.log(status);
		    	console.log(headers);
		    	console.log(config);
		    });

	}

})

.controller('boardCtrl', function($scope, $routeParams, $http){
  $http({method: 'GET', url: '/requestTopics'}).
    success(function(data, status, headers, config) {
    	$scope.topics = data
    }).
    error(function(data, status, headers, config) {
    	console.log(data);
    	console.log(status);
    	console.log(headers);
    	console.log(config);
    });
})