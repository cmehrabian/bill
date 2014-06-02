
angular.module('rhombus', ['components'])

.controller('viewTreeCtrl', function($scope, $http){

	var socket = io.connect(document.URL);
	

	var graph = new Springy.Graph();
	var nodes = []

	//var springyServ = springyServ

	$scope.selected = null

	$scope.username = ''
	$scope.parent_id = null
	//$scope.point_id = lastpoint_id + 1;
	$scope.flavor = 'comment'
	$scope.text = ''
	$scope.children = []
	$scope.links = []
	//$scope.value = 0


	$scope.points = []

	//$scope.flavors = ['comment', 'assent', 'dissent', 'quote', 'link']
	$scope.flavors = ['comment', 'assent', 'dissent', 'quote']

  	socket.on('update', function (data) {

  		if($scope.points[data.point_id] === undefined)
  		{
    		$scope.points[data.point_id] = data;
  			addNode(data.point_id, data.parent_id, data.text, data.flavor)

  		}
  		else {
  			$scope.points[data.point_id] = data;
  		}

  		if(data.origin_id !== undefined){
  			console.log(data.origin_id)
  			springyServ.addOriginEdge(data.point_id, data.origin_id)
  		}
    	//$scope.$digest()
	});

	socket.on('update_finished', function(data){
		$scope.$digest()
	})


  	socket.on('reset_all', function(data) {
  		$scope.points = []
  		nodes = []
  		$scope.selected = null

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
				parent_id:$scope.parent_id,
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


	var addNode = function (point_id, parent_id, text, flavor){
		var s = text.substring(0,20)
		if(text.length > 20)
			s += '...'
			nodes[point_id] = graph.newNode(
			{
				label:s,
		 		point_id:point_id,
		 		parent_id:parent_id,
		 		flavor:flavor
		 	})
		if(flavor == 'link'){
			graph.newEdge(nodes[point_id], nodes[$scope.points[point_id].links[0]], {color:'#000000'})	
			graph.newEdge(nodes[point_id], nodes[$scope.points[point_id].links[1]], {color:'#000000'})			
		}
		else if(parent_id != null){
			graph.newEdge( nodes[point_id], nodes[$scope.points[point_id].parent_id], {color: '#000000'})
		}
	}

	var addOriginEdge = function(point_id, origin_id){
		var edges = graph.getEdges(nodes[point_id], nodes[origin_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		edges = graph.getEdges(nodes[point_id], nodes[$scope.points[point_id].parent_id])
		if(edges[0] !== undefined)
			graph.removeEdge(edges[0])
		graph.newEdge(nodes[point_id], nodes[origin_id], {color: '#FF0011'})
		graph.newEdge(nodes[point_id], nodes[$scope.points[point_id].parent_id], {color: '#000000'})

		$scope.points[$scope.points[point_id].parent_id].children.push(point_id)
		//need to remove child from origin??
	}

	function drawGraph(){

		jQuery(function(){
			var springy = window.springy = jQuery('#springydemo').springy({
				graph: graph,
				nodeSelected: function(node){
					//console.log('Node selected: ' + JSON.stringify(node.data));
					$scope.selected = $scope.points[node.data.point_id].point_id
					$scope.parent_id = $scope.selected;
					//console.log($scope.points[$scope.selected].text)
					//console.log($scope.selected)
					$scope.$digest();
				}	
			});
		});
	}

	drawGraph();


})
