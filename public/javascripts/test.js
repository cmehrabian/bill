
function TestSendCtrl($scope, $http){
	var lastgramid = -1

	var socket = io.connect('http://localhost:3000');
	

  	socket.on('hello', function(data){
  		console.log(data.hello)
  	})

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

    	$scope.grams[data.gramid] = data;

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

	var dennis = graph.newNode({
	  label: 'Dennis',
	  ondoubleclick: function() { console.log("Hello!"); }
	});
	var michael = graph.newNode({label: 'Michael'});
	var jessica = graph.newNode({label: 'Jessica'});
	var timothy = graph.newNode({label: 'Timothy'});
	var barbara = graph.newNode({label: 'Barbara'});
	var franklin = graph.newNode({label: 'Franklin'});
	var monty = graph.newNode({label: 'Monty'});
	var james = graph.newNode({label: 'James'});
	var bianca = graph.newNode({label: 'Bianca'});

	graph.newEdge(dennis, michael, {color: '#00A0B0'});
	graph.newEdge(michael, dennis, {color: '#6A4A3C'});
	graph.newEdge(michael, jessica, {color: '#CC333F'});
	graph.newEdge(jessica, barbara, {color: '#EB6841'});
	graph.newEdge(michael, timothy, {color: '#EDC951'});
	graph.newEdge(franklin, monty, {color: '#7DBE3C'});
	graph.newEdge(dennis, monty, {color: '#000000'});
	graph.newEdge(monty, james, {color: '#00A0B0'});
	graph.newEdge(barbara, timothy, {color: '#6A4A3C'});
	graph.newEdge(dennis, bianca, {color: '#CC333F'});
	graph.newEdge(bianca, monty, {color: '#EB6841'});

	jQuery(function(){
	  var springy = window.springy = jQuery('#springydemo').springy({
	    graph: graph,
	    nodeSelected: function(node){
	      console.log('Node selected: ' + JSON.stringify(node.data));
	    }
	  });
	});
	
}
