

	resizeCanvas = function(){
		var canvas = document.getElementById('springydemo');
		canvas.width = window.innerWidth * .68;
		canvas.height = window.innerHeight * .95
		//console.log(canvas.width)
		//redraw();
	}

	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();

