Math.TAU = Math.PI*2;

var canvas = document.getElementById("canvas_sliders");
var ctx = canvas.getContext("2d");

var images = {};
images.bee = new Image();
images.bee.src = "images/bee.png";
images.beefly = new Image();
images.beefly.src = "images/beefly.png";

images.background = new Image();
images.background.src = "images/honeycomb.png";

//
// SLIDERS FOR CONFIGURING JITTER/SPEED
var bee_jitter = 0.3;
var return_speed = 1.5;
var dance_speed = 0.3;
var dance_jitter = 0.3;
var swarm_jitter = 0.3;
var swarm_speed = 1;
var flying_speed = 5

var bee_jitter_slider = document.getElementById("slider_bee_jitter");
var return_speed_slider = document.getElementById("slider_return_speed");
var dance_speed_slider = document.getElementById("slider_dance_speed");
var dance_jitter_slider = document.getElementById("slider_dance_jitter");
var swarm_speed_slider = document.getElementById("slider_swarm_speed");
var swarm_jitter_slider = document.getElementById("slider_swarm_jitter");
var flying_speed_slider = document.getElementById("slider_flying_speed");

var bee_jitter_display = document.getElementById("display_bee_jitter");
var return_speed_display = document.getElementById("display_return_speed");
var dance_speed_display = document.getElementById("display_dance_speed");
var dance_jitter_display = document.getElementById("display_dance_jitter");
var swarm_speed_display = document.getElementById("display_swarm_speed");
var swarm_jitter_display = document.getElementById("display_swarm_jitter");
var flying_speed_display = document.getElementById("display_flying_speed");

var vars = [bee_jitter, return_speed, dance_speed, dance_jitter, swarm_speed, flying_speed, swarm_jitter];
var sliders = [bee_jitter_slider, return_speed_slider, dance_speed_slider, dance_jitter_slider, swarm_speed_slider, flying_speed_slider, swarm_jitter_slider];
var displays = [bee_jitter_display, return_speed_display, dance_speed_display, dance_jitter_display, swarm_speed_display, flying_speed_display, swarm_jitter_display];
// FOR TESTING
//

function Bee(){
	
	var self = this;
	
	self.initX = 250;
	self.initY = 250;
	self.x = self.initX;
	self.y = self.initY;
	self.rotation = 0;

	self.dancing = false;
	self.returning = false;
	self.returnImmediately = false;
	
	self.jitter = 0.1;
	self.danceSpeed = 2;
	self.returnSpeed = 1.5;
	self.danceJitter = 0.3;

	self.turnAround = false;

	self.update = function(jitter, returnSpeed, danceSpeed, danceJitter){
		
		// console.log("updating bee: " + "(" + (self.x) + "," + (self.y) + ")");
		// console.log("returning        : " + self.returning)
		// console.log("returnImmediately: " + self.returnImmediately)

		self.jitter = jitter;
		self.returnSpeed = returnSpeed;
		self.danceSpeed = danceSpeed;
		self.danceJitter = danceJitter;

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
			self.returning = true;
			self.omega = .99;

			self.prevRotation = Math.atan2(self.y - self.initY, self.x - self.initX) - Math.TAU/4;
			self.prevRotation += (Math.random() >= 0.5 ? ((self.prevRotation <= -Math.TAU/4 && self.prevRotation >= -3*Math.TAU/4) ? Math.TAU : -Math.TAU) : 0);
			
			// IF I GET RID OF THIS, THE BEE ALWAYS LOOPS BACK IN A CIRCLE
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

			// The bee changes direction towards its origin faster as it gets closer (makes more progress)
			if (self.omega > 0.7) {
				self.omega -= .005;
			}

			var dx = self.x - self.initX;
			var dy = self.y - self.initY;
			var d2 = dx*dx + dy*dy;

			// If we're way too close (avoids unregulated oscillation lol)
			if(d2 < self.returnSpeed*self.returnSpeed){
				self.x = self.initX;
				self.y = self.initY;
				self.turnAround = true;
				self.returnImmediately = false;
				self.returning = false;
				return;
			}

			// Points to the bee's origin
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;

			// FIXES OUT OF CONTROL OSCILLATION 
			while (Math.abs(self.prevRotation - rotation) > 1) {
				rotation += (rotation > self.prevRotation ? -Math.TAU : Math.TAU);
			}
			self.prevRotation = rotation;

			
			// Kind of hacky, but this additional check avoids the bee "overshooting" its origin and forces it to return immediately
			if (self.returnImmediately){
				// Doesn't work as intended -- the goal was to gradually point towards the mouse when close to the origin
				self.rotation = self.rotation*alpha + (1-alpha)*(Math.atan2(self.initY - Mouse.y,self.initX - Mouse.x) - Math.TAU/4 - rotation);
				self.x = self.x*alpha + self.initX*(1-alpha);
				self.y = self.y*alpha + self.initY*(1-alpha);
			} else {
				// Have the bee turn back around according to omega and move a bit in that direction
				self.rotation = self.rotation*(self.omega) + (1 - self.omega)*(rotation);
				self.x += Math.sin(self.rotation)*self.returnSpeed;
				self.y -= Math.cos(self.rotation)*self.returnSpeed;
			}
			
			// IF I GET RID OF THIS, THE BEE ALWAYS LOOPS BACK IN A CIRCLE
			// If we're too close and nearly facing the origin
			if(Math.abs(rotation - self.rotation) <= 0.05 && d2 < 10){
				self.returnImmediately = true;
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
			var r = Math.sin(self.waggle)*self.danceJitter;
			ctx.rotate(r);
		} else if (self.returning) {
			self.waggle += 1;
			var r = Math.sin(self.waggle)*self.jitter;
			ctx.rotate(r);
		}
		
		/*ctx.fillStyle = "#FFD700";
		//ctx.beginPath();
		ctx.fillRect(-10, -20, 20, 40);*/
		ctx.drawImage(images.bee, -30, -30, 60, 60);
		
		ctx.restore();
	};

}

// Autonomous Bee
function AutonomousBee(x, y){
	
	var self = this;
	
	self.initX = x;
	self.initY = y;
	self.x = self.initX;
	self.y = self.initY;
	self.rotation = Math.random()*Math.TAU;

	self.takeoff = false;
	self.flying = false;
	self.animate = 0;

	self.speed = .5;
	self.flyingSpeed = 5;
	self.swarmJitter = 0.03;
	self.offset = -30;
	self.scale = 60;

	self.update = function(swarmSpeed, flyingSpeed, swarmJitter){
		self.speed = swarmSpeed;
		self.flyingSpeed = flyingSpeed;
		self.swarmJitter = swarmJitter;

		self.x += (self.flying ? self.flyingSpeed : self.speed) * Math.sin(self.rotation);
		self.y -= (self.flying ? self.flyingSpeed : self.speed) * Math.cos(self.rotation);

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
		var r = Math.sin(self.waggle)*self.swarmJitter;
		ctx.rotate(r);
		
		var alpha = .99;

		if (self.takeoff && self.animate == 0) {
			self.offset -= 1;
			self.scale += 2;
			self.takeoff = (self.scale < 88);
		}

		if (self.flying && self.animate == 0) {
			ctx.drawImage(images.beefly, self.offset, self.offset, self.scale, self.scale);
			self.animate = 1;
		} else {
			ctx.drawImage(images.bee, self.offset, self.offset, self.scale, self.scale);
			self.animate = 0;
		}
		
		ctx.restore();
	};

	self.fly = function(rotation){ // need to add animation
		self.rotation = rotation;
		self.flying = true;
		self.speed = self.flyingSpeed;
		self.takeoff = true;
	}

}

function Swarm(bee, width, height){

	var self = this;

	self.bees = [];

	for(i = 0; i < 12; i++){
		self.bees.push(new AutonomousBee(Math.random()*width, Math.random()*height));
	}

	self.update = function(swarmSpeed, flightSpeed, swarmJitter){
		if (Math.random() > 0.5) {
			var rand = Math.random();
			if (rand <= 0.25) {
				self.bees.push(new AutonomousBee(-10, Math.random()*canvas.height));
			}
			else if (rand <= 0.5) {
				self.bees.push(new AutonomousBee(Math.random()*canvas.width, -10));
			}
			else if (rand <= 0.75) {
				self.bees.push(new AutonomousBee(canvas.width + 10, Math.random()*canvas.height));
			}
			else {
				self.bees.push(new AutonomousBee(Math.random()*canvas.width, canvas.height + 10));
			}
		}

		for(i = 0; i < self.bees.length; i++){
			if (bee.dancing) {
				if (Math.sqrt(Math.pow(bee.x - self.bees[i].x, 2) + Math.pow(bee.y - self.bees[i].y, 2)) < 50){
					self.bees[i].fly(bee.rotation);
				}
			}
			// If a bee is outside the canvas, delete it
			if (self.bees[i].x < -15 || self.bees[i].x > 515 || self.bees[i].y < -15 || self.bees[i].y > 515) {
				self.bees.splice(i, 1);
				i++;
			}
			else {
				self.bees[i].update(swarmSpeed, flightSpeed, swarmJitter);
			}
		}
	};

	self.draw = function(ctx){
		for(i = 0; i < self.bees.length; i++){
			self.bees[i].draw(ctx);
		}
	};

}

var bee = new Bee();
var swarm = new Swarm(bee, canvas.width, canvas.height);

// Game Loop
function update(){

	// SLIDERS
	for (var i = 0; i < vars.length; i++) {
		vars[i] = sliders[i].value;
		displays[i].innerHTML = vars[i];
	}
	// FOR TESTING

	// Update bee and swarm
	bee.update(vars[0], vars[1], vars[2], vars[3]);
	swarm.update(vars[4], vars[5], vars[6]);

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


