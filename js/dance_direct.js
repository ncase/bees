Math.TAU = Math.PI*2;

var canvas = document.getElementById("canvas_dance_direct");
var ctx = canvas.getContext("2d");

var images = {};
images.bee = new Image();
images.bee.src = "images/bee.png";

images.background = new Image();
images.background.src = "images/honeycomb.png";

// Bee
function AutonomousBee(x, y){
	
	var self = this;
	
	self.initX = x;
	self.initY = y;
	self.x = self.initX;
	self.y = self.initY;
	self.rotation = Math.random()*Math.TAU;

	self.flying = false;

	self.speed = .5;

	self.update = function(){
		self.x += self.speed * Math.sin(self.rotation);
		self.y -= self.speed * Math.cos(self.rotation);

		self.swerve = (Math.random()-0.5)*0.1;

		// Swerve
		self.angle += self.swerve;
		if(Math.random()<0.05) self.swerve = (Math.random()-0.5)*0.1;
	};
	
	self.waggle = 0;

	self.draw = function(ctx){

		ctx.save();

		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);

		self.waggle += 1; // this is the jitter for the sisters
		var r = Math.sin(self.waggle)*0.03;
		ctx.rotate(r);
		

		ctx.drawImage(images.bee, -30, -30, 60, 60);
		
		ctx.restore();
	};

	self.fly = function(rotation){ // need to add animation
		self.rotation = rotation;
		self.speed = 5;
	}

}

var bee = new Bee();
var bees = [];

for(i = 0; i < 12; i++){
	bees.push(new AutonomousBee(Math.random()*canvas.width, Math.random()*canvas.height));
}

// Game Loop
function update(){

	// Update bee
	if (Math.random() > 0.80) {
		var rand = Math.random();
		if (rand <= 0.25) {
			bees.push(new AutonomousBee(-10, Math.random()*canvas.height));
		}
		else if (rand <= 0.5) {
			bees.push(new AutonomousBee(Math.random()*canvas.width, -10));
		}
		else if (rand <= 0.75) {
			bees.push(new AutonomousBee(canvas.width + 10, Math.random()*canvas.height));
		}
		else {
			bees.push(new AutonomousBee(Math.random()*canvas.width, canvas.height + 10));
		}
	}
	bee.update();
	for(i = 0; i < bees.length; i++){
		if (bee.dancing) {
			if (Math.sqrt(Math.pow(bee.x - bees[i].x, 2) + Math.pow(bee.y - bees[i].y, 2)) < 50){
				bees[i].fly(bee.rotation);
			}
		}
		// If a bee is outside the canvas, delete it
		if (bees[i].x < -15 || bees[i].x > 515 || bees[i].y < -15 || bees[i].y > 515) {
			bees.splice(i, 1);
			i++;
		}
		else {
			bees[i].update();
		}
	}

	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
  	// draw bg
  	ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
	ctx.scale(2,2);
	// Draw bee
	bee.draw(ctx);
	for(i = 0; i < bees.length; i++){
		bees[i].draw(ctx);
	}
	ctx.restore();
  

	window.requestAnimationFrame(update);

}
update();

// Mouse
window.onload = function(){
	Mouse.init(canvas);
};

