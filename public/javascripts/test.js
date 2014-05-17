
function TestSendCtrl($scope, $http){
	var lastgramid = -1

	var socket = io.connect('http://localhost:3000');
	
	$scope.username = ''
	$scope.parentid = -1
	//$scope.gramid = lastgramid + 1;
	$scope.flavor = ''
	$scope.text = ''
	//$scope.value = 0


	$scope.grams = []

	$scope.flavors = 
	['comment', 'assent', 'dissent']


  	socket.on('update', function (data) {



  		if($scope.grams[data.gramid] === undefined)
  		{
    		$scope.grams[data.gramid] = data;

  			addNode(data.gramid)

  			jQuery(function(){
	  			var springy = window.springy = jQuery('#springydemo').springy({
	    			graph: graph,
	    			nodeSelected: function(node){
	      				console.log('Node selected: ' + JSON.stringify(node.data));
	    			}	
	  			});
			});

  		}
  		else {
  			$scope.grams[data.gramid] = data;

  		}


    	$scope.$digest()
	});


	$scope.submit = function(){
		
		socket.emit('new_gram', {
				username:$scope.username,
				parentid:$scope.parentid,
				flavor:$scope.flavor,
				text:$scope.text
			})
		$scope.parentid = -1
		$scope.flavor = ''
		$scope.text = ''
		
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
		 		gram_id:gram_id
		 	})
		

		if($scope.grams[$scope.grams[gram_id].parentid] != null){
			graph.newEdge(nodes[gram_id], nodes[$scope.grams[gram_id].parentid], {color: '#000000'})
		}
	}

}
