
function TestSendCtrl($scope, $http){
	var lastgramid = -1

	var socket = io.connect('http://localhost:3000');
	
  	socket.on('update', function (data) {
    	console.log(data);
    	//socket.emit('my other event', { my: 'data' });
    	grams[data.gramid] = data;
	});

  	socket.on('hello', function(data){
  		console.log(data.hello)
  	})

	$scope.username = ''
	$scope.parentid = -1
	$scope.gramid = lastgramid + 1;
	$scope.flavor = null
	$scope.text = ''


	$scope.grams = []

	$scope.flavors = 
	['comment', 'assent', 'dissent']

	$scope.submit = function(){
		socket.emit('new_gram', {
				username:$scope.username,
				parentid:$scope.parentid,
				flavor:$scope.flavor,
				text:$scope.text
			})
		
	}
}
