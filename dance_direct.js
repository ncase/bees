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

function Bee(){
	
	var self = this;
	
	self.initX = 250;
	self.initY = 250;
	self.x = self.initX;
	self.y = self.initY;
	self.rotation = 0;

	self.dancing = false;
	self.returning = false;
	self.danceSpeed = 2;

	self.update = function(){

		// console.log("rotation:  " + self.rotation)
		// Rotation
		var dx = self.initX - Mouse.x;
		var dy = self.initY - Mouse.y;
		if(!self.dancing && !self.returning){
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;
			self.rotation = rotation;
		}

		// Mouse
		if(self.dancing && !Mouse.pressed){
			self.distX = Math.abs(self.x - self.initX);
			self.distY = Math.abs(self.y - self.initY);
			self.lineX = self.x;
			self.lineY = self.y;
			// self.slope = (self.y - self.initY)/(self.x - self.initX);
			// self.angle = self.rotation;
			self.returning = true;

			var dx = self.x - self.initX;
			var dy = self.y - self.initY;

			self.prevRotation = Math.atan2(dy,dx) - Math.TAU/4;

			console.log("STARTED RETURN: " + self.prevRotation)

			if (self.distX + self.distY <= 45){
				self.returnImmediately = true;
			}
		}
		self.dancing = !self.returning && Mouse.pressed;

		// DANCE?
		if(self.dancing && !self.returning){
			self.x += Math.sin(self.rotation)*self.danceSpeed;
			self.y -= Math.cos(self.rotation)*self.danceSpeed;
		}

		// RETURN
		if(self.returning) {
			var alpha = 0.95;

			// Ah, I'm using these to measure progress along the line from the turnaround point to the initial point, from 0 to 1
			var progress = 1 - (Math.abs(self.lineX - self.initX)/self.distX + 
								Math.abs(self.lineY - self.initY)/self.distY)/2;
			self.lineX = self.lineX*alpha + self.initX*(1-alpha);
			self.lineY = self.lineY*alpha + self.initY*(1-alpha);

			// The bee changes direction towards its origin faster as it gets closer (makes more progress)
			// var omega = 0.95 - progress*(0.15);

			var omega = 0.95;

			var dx = self.x - self.initX;
			var dy = self.y - self.initY;

			// Points to the bee's origin
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;
			
			// FIXES OUT OF CONTROL OSCILLATION 
			while (Math.abs(self.prevRotation - rotation) > 1) {
				// console.log("TRIED TO FIX " + rotation + " => " + (rotation + Math.TAU))
				if (rotation > self.prevRotation) {
					rotation -= Math.TAU;
				}
				else {
					rotation += Math.TAU;
				}
			}
			self.prevRotation = rotation;

			var d2 = dx*dx + dy*dy;
			// Kind of hacky, but this additional check avoids the bee "overshooting" its origin and forces it to return immediately
			if (self.returnImmediately){
				// Doesn't work as intended -- the goal was to gradually point towards the mouse when close to the origin
				self.rotation = self.rotation*alpha + (1-alpha)*(Math.atan2(self.initY - Mouse.y,self.initX - Mouse.x) - Math.TAU/4 - rotation);
				self.x = self.x*alpha + self.initX*(1-alpha);
				self.y = self.y*alpha + self.initY*(1-alpha);
			} else {
				// Have the bee turn back around according to omega and move a bit in that direction
				self.rotation = self.rotation*(omega) + (1 - omega)*(rotation);
				self.x += Math.sin(self.rotation)*self.danceSpeed;
				self.y -= Math.cos(self.rotation)*self.danceSpeed;
			}
			// If we're too close and nearly facing the origin
			if(Math.abs(rotation - self.rotation) <= 0.05 && d2 < 10){
				self.returnImmediately = true;
			}
			// If we're way too close (avoids unregulated oscillation lol)
			if(d2<5){
				self.x = self.initX;
				self.y = self.initY;
				// Again, doesn't work as inteneded (Line 84)
				self.rotation = rotation*alpha + (1-alpha)*(Math.atan2(self.initY - Mouse.y,self.initX - Mouse.x) - Math.TAU/4 - rotation);
				self.returnImmediately = false;
				self.returning = false;
			}
		}

	};
	
	self.waggle = 0;
	self.draw = function(ctx){

		ctx.save();

		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);

		// WAGGLE
		if(self.dancing){
			self.waggle += 1;
			var r = Math.sin(self.waggle)*0.3;
			ctx.rotate(r);
		}
		
		/*ctx.fillStyle = "#FFD700";
		//ctx.beginPath();
		ctx.fillRect(-10, -20, 20, 40);*/
		ctx.drawImage(images.bee, -30, -30, 60, 60);
		
		ctx.restore();
	};

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

