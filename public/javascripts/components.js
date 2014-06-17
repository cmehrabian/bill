angular.module('components', [])

.factory('graph', function($window, $rootScope){

	var resizeCanvas = function(){
		console.log('resized')
		canvas.width = $window.innerWidth * .68;
		canvas.height = $window.innerHeight * .95
		//currentBB = layout.getBoundingBox();
	}

	var canvas;
	var ctx; 

	var graph;
	var layout;
	var currentBB;
	var renderer;

	var stiffness = 400.0;
	var repulsion = 400.0;
	var damping = 0.5;

	var nodes;
	var edges;



	var init = function(){
		//if(canvas == null) return 

		canvas = document.getElementById('graphcanvas')
		ctx = canvas.getContext("2d")

		nodes = []
		edges = []

		resizeCanvas();

		graph = new Springy.Graph();

		layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping);

		currentBB = layout.getBoundingBox()

		Springy.requestAnimationFrame(function adjust() {
			targetBB = layout.getBoundingBox();
			// current gets 20% closer to target every iteration
			currentBB = {
				bottomleft: currentBB.bottomleft.add( targetBB.bottomleft.subtract(currentBB.bottomleft)
					.divide(10)),
				topright: currentBB.topright.add( targetBB.topright.subtract(currentBB.topright)
					.divide(10))
			};

			Springy.requestAnimationFrame(adjust);
		});


		renderer = new Springy.Renderer(layout,
			function clear(){
				canvas.width = canvas.width
				//ctx.clearRect(0,0, canvas.wpoint_idth,canvas.height);
				//ctx.clearRect(0,0,canvas.wpoint_idth,canvas.height);

			},
			function drawEdge(edge, p1, p2){
	        	var s1 = toScreen(p1);
	        	var s2 = toScreen(p2);
	        	ctx.beginPath(); 
				ctx.lineWidth="2";
				ctx.strokeStyle="black"; // Green path

				//var direction = new Springy.Vector(p2.x- p1.x, p2.y - p1.y);
				//var slope = (p2.y - p1.y) / (p2.x - p1.x)

				//b = c / (sqrt(m+1))
				//var tangy = (p2.data.propogated + 10) / Math.sqrt(Math.pow(slope, 2) + 1) 
				//var tangx = tangy * slope


				ctx.moveTo(s1.x, s1.y)
				ctx.lineTo(s2.x, s2.y)
				ctx.stroke()

			},
			function drawNode(node, p){
				//console.log(currentBB)
	      		var s = toScreen(p)


	      		  //var radgrad = ctx.createRadialGradient(60,60,0,60,60,60);
				  //radgrad.addColorStop(0, 'rgba(255,0,0,1)');
				  //radgrad.addColorStop(0.8, 'rgba(228,0,0,.9)');
				  //radgrad.addColorStop(1, 'rgba(228,0,0,0)');
				  /*
				if(node.data.value != 0){
				    var radgrad = ctx.createRadialGradient(s.x,s.y,0,node.data.value * 5 + 60 ,60,60);
				    if(node.data.value > 0){
				    	var color = 'green'
				    
				    }
				    else{
				    	var color = 'red'
				    }

				    radgrad.addColorStop(0, color)
				    radgrad.addColorStop(1, color)

				    ctx.fillStyle = radgrad
				    ctx.fillRect(s.x - 100, s.y - 100, 200, 200)

				}
	*/
	      		//console.log(s)
	      		ctx.fillStyle = '#FFFFFF'
	      		if(node.data.flavor == 'dissent')
	      			ctx.fillStyle = '#FF9966' //red
	      		if(node.data.flavor == 'assent')
	      			ctx.fillStyle = '#99FF66' //green
	      		if($rootScope.selected == node.data)
	      			ctx.fillStyle = '#FFFF66' //yellow

	      		ctx.lineWidth="2"
				//ctx.fillRect(s.x - 10,s.y - 10 , 20,20);
				//ctx.rect(s.x -10, s.y - 10, 20, 20)
				ctx.beginPath();
	      		ctx.arc(s.x, s.y, node.data.propogated + 10, 0, 2 * Math.PI, false);
	      		ctx.fill()
				ctx.stroke();
			})

		renderer.start()
		console.log('graph initialized')

			$window.addEventListener('resize', resizeCanvas, false);

		canvas.addEventListener('click', function(event){
		var totalOffsetX = 0;
    	var totalOffsetY = 0;
    	var canvasX = 0;
    	var canvasY = 0;
    	var currentElement = this;

    	do{
        	totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        	totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    	}
    	while(currentElement = currentElement.offsetParent)

    	canvasX = event.pageX - totalOffsetX;
    	canvasY = event.pageY - totalOffsetY;


    	var p = fromScreen({x: canvasX, y: canvasY});
		$rootScope.selected = layout.nearest(p).node.data;

		$rootScope.$digest()
		
		renderer.start()
	})


	}








	var toScreen = function(p) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * canvas.width;
		var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * canvas.height;
		return new Springy.Vector(sx, sy);
	};

	var fromScreen = function(s) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var px = (s.x / canvas.width) * size.x + currentBB.bottomleft.x;
		var py = (s.y / canvas.height) * size.y + currentBB.bottomleft.y;
		return new Springy.Vector(px, py);
	};



	var newNode = function(data){

		var node = graph.newNode(data);
		nodes.push(node);
		return node
	}

	var newEdge = function(n1, n2){
		graph.newEdge(n1 , n2)

	}

	var update = function(data, request_id){

		console.log('data:')
		console.log(data)
		console.log('nodes:')
		console.log(nodes)

		if(nodes.length == 0){
			_.forEach(data, function(point){

				var node = graph.newNode(point)
				nodes.push(node)

				var parent = _.find(nodes, function(n){
					return n.data.point_id == point.parent
				})

				if(parent !== undefined){
					graph.newEdge(node, parent)
				}

				_.forEach(point.children, function(child){
					var c = _.find(nodes, function(damn){
						return damn.data.point_id == child
					})
					if(c !== undefined){
						graph.newEdge(c, node)
					}
				})

			})
		}
		else{
			var parent = _.find(nodes, function(n){
				//console.log(n)
				return n.data.point_id == data[0].parent
			})

			if(parent === undefined){
				console.log('irrelevant update')
				return
			}
			else{
				var node = graph.newNode(data[0])
				nodes.push(node)
				graph.newEdge(node, parent)
				_.forEach(data, function(p){
					_.find(nodes, function(n){
						return p.point_id == n.data.point_id
					}).data = p
				})
			}
		}

		console.log('nodes:')
		console.log(nodes)

		/*
		var points = _.pluck(nodes, 'data')

		var request = _.find(points, {point_id:parseInt(request_id)})
		 console.log(points)
		// console.log(points.length)
		//console.log(points.length == 0)
		if(points.length != 0 && (request === undefined || data[0].root != request.root)){
			console.log('bad request or irrelevant update')
			return
		}


		_.forEach(data, function(n){
			var elem = _.find(points, {point_id:n.point_id})
			if(elem === undefined){
				var node = graph.newNode(n)
				nodes.push(node)

				var parent = _.find(nodes, function(){
					n.data.point_id == 
				})
				/*
				if(n.parent != null){
					var parent = _.find(nodes, {data:_.find(points, {point_id:n.parent})})
					graph.newEdge(node, parent)
				}


			}
			else{
				_.find(nodes, {data:elem}).data = n
			}
		})
*/


	}

	return {
		update:update,
		init:init
	}

})

.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    removeAllListeners: function(){
    	socket.removeAllListeners()
    }
  };
});