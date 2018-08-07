Math.TAU = Math.PI*2;

var canvas = document.getElementById("canvas_dance");
var ctx = canvas.getContext("2d");

var images = {};
images.bee = new Image();
images.bee.src = "images/bee.png";

images.background = new Image();
images.background.src = "images/honeycomb.png";

var bee = new Bee();

// Game Loop
function update(){

	// Update bee
	bee.update();

	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
  	// draw bg
  	ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
	ctx.scale(2,2);
	// Draw bee
	bee.draw(ctx);
	ctx.restore();
  
	window.requestAnimationFrame(update);
}
update();

// Mouse
window.onload = function(){
	Mouse.init(canvas);
};

