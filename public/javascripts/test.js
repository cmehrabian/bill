
function TestSendCtrl($scope, $http){
	var lastgram_id = -1

	var socket = io.connect('http://localhost:3000');
	

	$scope.selected = null

	$scope.username = ''
	$scope.parent_id = null
	//$scope.gram_id = lastgram_id + 1;
	$scope.flavor = ''
	$scope.text = ''
	//$scope.value = 0


	$scope.grams = []

	$scope.flavors = 
	['comment', 'assent', 'dissent']


  	socket.on('update', function (data) {



  		if($scope.grams[data.gram_id] === undefined)
  		{
    		$scope.grams[data.gram_id] = data;

  			addNode(data.gram_id)


  		}
  		else {
  			$scope.grams[data.gram_id] = data;

  		}


    	$scope.$digest()
	});

  	socket.on('reset_all', function(data) {
  		$scope.grams = []
  		nodes = []
  		$scope.selected = null

		$scope.username = ''
		$scope.parent_id = null
		$scope.flavor = ''
		$scope.text = ''

  		$scope.$digest()
  		//graph = new Springy.Graph()
  		//drawGraph()
  	})

	$scope.submit = function(){
		
		socket.emit('new_gram', {
				username:$scope.username,
				parent_id:$scope.parent_id,
				flavor:$scope.flavor,
				text:$scope.text
			})
		//$scope.parent_id = -1
		$scope.flavor = ''
		$scope.text = ''
		
	}

	$scope.reset = function(){
		socket.emit('reset', {});
		//graph = new Springy.Graph()
  		//drawGraph()
	}

	var graph = new Springy.Graph();

	var nodes = []

	function addNode(gram_id){
		var s = $scope.grams[gram_id].text.substring(0,20)
		if($scope.grams[gram_id].text.length > 20)
			s += '...'
		nodes[gram_id] = graph.newNode(
			{
				label:s,
		 		gram_id:gram_id,
		 		flavor:$scope.grams[gram_id].flavor
		 	})
		

		if($scope.grams[$scope.grams[gram_id].parent_id] != null){
			graph.newEdge(nodes[gram_id], nodes[$scope.grams[gram_id].parent_id], {color: '#000000'})
		}
	}

	function drawGraph(){

		jQuery(function(){
			var springy = window.springy = jQuery('#springydemo').springy({
				graph: graph,
				nodeSelected: function(node){
					//console.log('Node selected: ' + JSON.stringify(node.data));
					$scope.selected = $scope.grams[node.data.gram_id].gram_id
					$scope.parent_id = $scope.selected
					//console.log($scope.grams[$scope.selected].text)
					//console.log($scope.selected)
					$scope.$digest()
				}	
			});
		});
	}

	drawGraph()
}
