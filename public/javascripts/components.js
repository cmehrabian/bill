angular.module('components', [])

.factory('graph', function($window, $rootScope){

	var canvas = document.getElementById('graphcanvas')
	if(canvas == null) return 
	var ctx = canvas.getContext("2d")

	var graph = new Springy.Graph();

	var stiffness = 400.0;
	var repulsion = 400.0;
	var damping = 0.5;

	var layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping);

	var currentBB = layout.getBoundingBox()
	var nodes = []
	var edges = []

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



	var resizeCanvas = function(){
		console.log('resized')
		canvas.width = $window.innerWidth * .68;
		canvas.height = $window.innerHeight * .95
		//currentBB = layout.getBoundingBox();
	}

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


	resizeCanvas();



	var toScreen = function(p) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var sx = p.subtract(currentBB.bottomleft).divpoint_ide(size.x).x * canvas.wpoint_idth;
		var sy = p.subtract(currentBB.bottomleft).divpoint_ide(size.y).y * canvas.height;
		return new Springy.Vector(sx, sy);
	};

	var fromScreen = function(s) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var px = (s.x / canvas.wpoint_idth) * size.x + currentBB.bottomleft.x;
		var py = (s.y / canvas.height) * size.y + currentBB.bottomleft.y;
		return new Springy.Vector(px, py);
	};


	var renderer = new Springy.Renderer(layout,
		function clear(){
			canvas.wpoint_idth = canvas.wpoint_idth
			//ctx.clearRect(0,0, canvas.wpoint_idth,canvas.height);
			//ctx.clearRect(0,0,canvas.wpoint_idth,canvas.height);

		},
		function drawEdge(edge, p1, p2){
        	var s1 = toScreen(p1);
        	var s2 = toScreen(p2);
        	ctx.beginPath(); 
			ctx.lineWpoint_idth="2";
			ctx.strokeStyle="black"; // Green path
			ctx.moveTo(s1.x, s1.y)
			ctx.lineTo(s2.x, s2.y)
			ctx.stroke()

		},
		function drawNode(node, p){
			//console.log(currentBB)
      		var s = toScreen(p)
      		//console.log(s)
      		ctx.fillStyle = '#FFFFFF'
      		if(node.data.flavor == 'dissent')
      			ctx.fillStyle = '#FF9966' //red
      		if(node.data.flavor == 'assent')
      			ctx.fillStyle = '#99FF66' //green
      		if($rootScope.selected == node.data)
      			ctx.fillStyle = '#FFFF66' //yellow

      		ctx.lineWpoint_idth="2"
			ctx.fillRect(s.x - 10,s.y - 10 , 20,20);
			ctx.rect(s.x -10, s.y - 10, 20, 20)
			ctx.stroke();
		})

	renderer.start()

	var newNode = function(data){
		var node = graph.newNode(data);
		nodes.push(node);
	}

	var newEdge = function(i1, i2){
		graph.newEdge(nodes[i1] , nodes[i2])

	}


	return {
		newNode:newNode,
		newEdge:newEdge,
		nodes:nodes,
		edges:edges
	}

})
