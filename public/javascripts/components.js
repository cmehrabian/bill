angular.module('components', [])

.factory('graph', function($window){

	var resizeCanvas = function(){
		//canvas.width = $window.innerWidth * .68;
		canvas.width = $window.innerWidth * .95
		canvas.height = $window.innerHeight * .95
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

	var selected = null
	var children = null
	var parent = null

	var notify

	var mouse = {x:0, y:0}

	var init = function(){
		/*
		if(canvas == null) 
			console.log('shit is really, really fucked') 
*/
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
			},
			function drawEdge(edge, p1, p2){
	        	var s1 = toScreen(p1);
	        	var s2 = toScreen(p2);
	        	ctx.beginPath(); 
				ctx.lineWidth="2";
				ctx.strokeStyle="black"; // Green path

				var slope = (s2.y - s1.y) / (s2.x - s1.x)
				var radius = edge.target.data.propogated * 2 + 10

				var tanx = radius / Math.sqrt(Math.pow(slope,2) + 1)
				var arrowLength = 10
				var arrowWidth = 2


				if(s2.x > s1.x)
					tanx = -tanx

				var tany = slope * tanx

				tanx += s2.x
				tany += s2.y

				ctx.save();
				ctx.fillStyle = 'black';
				ctx.translate(tanx, tany);
				ctx.rotate(Math.atan2(s2.y - s1.y, s2.x - s1.x));
				ctx.beginPath();
				ctx.moveTo(-arrowLength, arrowWidth);
				ctx.lineTo(0, 0);
				ctx.lineTo(-arrowLength, -arrowWidth);
				ctx.lineTo(-arrowLength * 0.8, -0);
				ctx.closePath();
				ctx.fill();
				ctx.restore();




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

				var radius = node.data.propogated * 2 + 10
				if(mouse.x < s.x + radius && mouse.x > s.x - radius && mouse.y < s.y + radius && mouse.y > s.y - radius){
					ctx.font = "14px Arial";
					ctx.fillText(node.data.text, s.x + radius + 10, s.y + radius + 10)
				}
	      		//console.log(s)
	      		if(node.data.parent == null){
		      		ctx.fillStyle = 'gray'
		      		var len = node.data.propogated * 2 + 30
		      		ctx.fillRect(s.x - len / 2, s.y - len/2, len, len)
				}
	      		ctx.fillStyle = '#F1F1F2'
	      		if(node.data.flavor == 'dissent')
	      			ctx.fillStyle = '#FF9966' //red
	      		if(node.data.flavor == 'assent')
	      			ctx.fillStyle = '#99FF66' //green
	      		if(selected == node)
	      			ctx.fillStyle = '#FFFF66' //yellow

	      		ctx.lineWidth="2"
				ctx.beginPath();

	      		ctx.arc(s.x, s.y, radius, 0, 2 * Math.PI, false);
	      		ctx.fill()

	      		var ss = 'black'
	      		if(!node.seen)
	      			ss = 'blue'

	      		ctx.strokeStyle = ss
				ctx.stroke();
			})

		renderer.start()

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

	    	select(layout.nearest(p).node)

		})

		canvas.addEventListener('mousemove',function(event){
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

	    	mouse.x = event.pageX - totalOffsetX;
	    	mouse.y = event.pageY - totalOffsetY;
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




	var update = function(data, request_id){


		if(nodes.length == 0){
			_.forEach(data, function(point){

				var node = graph.newNode(point)
				node.seen = false
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
			select(_.find(nodes, function(n){return n.data.point_id == parseInt(request_id)}))
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
				node.seen = false
				nodes.push(node)
				graph.newEdge(node, parent)
				_.forEach(data, function(p){
					_.find(nodes, function(n){
						return p.point_id == n.data.point_id
					}).data = p
				})
			}

			select(selected)

		}

	}

	var select = function(node){
		if (node == null){
			selected = null
			children = null
		}
		else{
			node.seen = true
			selected = node
			children = _.where(nodes, function(n){
				return node.data.point_id == n.data.parent
			})
			parent = _.find(nodes, function(n){
				return n.data.point_id == node.data.parent
			})

			if (parent === undefined)
				parent = null
		}
		notify(selected, children, parent)
		renderer.start()
	}

	var registerSelectionChange = function(callback){
		notify = callback
	}


	return {
		update:update,
		init:init,
		select:select,
		registerSelectionChange:registerSelectionChange
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