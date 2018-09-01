var canvas = document.getElementById("canvas_dance_direct");
var ctx = canvas.getContext("2d");

var images = {};
images.bee = new Image();
images.bee.src = "images/bee.png";
images.beefly = new Image();
images.beefly.src = "images/beefly.png";

images.background = new Image();
images.background.src = "images/honeycomb.png";

var bee = new Bee();
var swarm = new Swarm(bee, canvas.width, canvas.height);

// Game Loop
function update(){

	// Update bee and swarm
	bee.update();
	swarm.update();

	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
  	
  	// draw bg
  	ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
	ctx.scale(2,2);
	
	// Draw bee and swarm
	bee.draw(ctx);
	swarm.draw(ctx);
	ctx.restore();
  

	window.requestAnimationFrame(update);

}
update();

// Mouse
window.onload = function(){
	Mouse.init(canvas);
};
