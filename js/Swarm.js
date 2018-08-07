// Autonomous Bee
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

function Swarm(bee, width, height){

	var self = this;

	self.bees = [];

	for(i = 0; i < 12; i++){
		self.bees.push(new AutonomousBee(Math.random()*width, Math.random()*height));
	}

	self.update = function(){
		if (Math.random() > 0.80) {
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
				self.bees[i].update();
			}
		}
	};

	self.draw = function(ctx){
		for(i = 0; i < self.bees.length; i++){
			self.bees[i].draw(ctx);
		}
	};

}